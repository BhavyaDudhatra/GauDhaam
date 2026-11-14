const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyDJR8t41dcVSIz9J4QLKXf85zpJV6F1O0k';

async function geocodeGoogle(address: string) {
  // Try full address first, then progressively simpler versions
  const parts = address.split(',').map(p => p.trim()).filter(Boolean);
  const candidates: string[] = [address];
  if (parts.length > 2) {
    candidates.push(parts.slice(-3).join(', '));
    candidates.push(parts.slice(-2).join(', '));
  }
  const pincodeMatch = address.match(/\b(\d{6})\b/);
  if (pincodeMatch) {
    candidates.push(pincodeMatch[1]);
  }
  
  for (const candidate of candidates) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(candidate)}&key=${GOOGLE_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'OK' && data.results?.[0]) {
        const loc = data.results[0].geometry.location;
        return { lat: loc.lat, lng: loc.lng };
      }
    } catch {
      // continue to next candidate
    }
  }
  return null;
}

async function distanceMatrixGoogle(origins: {lat:number,lng:number}[], destination:{lat:number,lng:number}) {
  try {
    const originsParam = origins.map(o => `${o.lat},${o.lng}`).join('|');
    const destParam = `${destination.lat},${destination.lng}`;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsParam}&destinations=${destParam}&units=metric&key=${GOOGLE_API_KEY}`;
    const res = await fetch(url);
    return res.json();
  } catch {
    return { rows: [] };
  }
}

// Nominatim (OpenStreetMap) geocoding - free, no API key needed
async function geocodeNominatim(address: string) {
  // Try the full address first, then progressively simpler versions
  const parts = address.split(',').map(p => p.trim()).filter(Boolean);
  
  // Build candidate queries from most specific to least specific
  const candidates: string[] = [address];
  if (parts.length > 2) {
    // Try last 3 parts (city, state, pincode)
    candidates.push(parts.slice(-3).join(', '));
    // Try last 2 parts (city, pincode)
    candidates.push(parts.slice(-2).join(', '));
    // Try city + state
    if (parts.length >= 3) {
      candidates.push(parts[parts.length - 2] + ', ' + parts[parts.length - 1]);
    }
    // Try just the city name (extract from parts)
    const pincodeMatch = address.match(/\b(\d{6})\b/);
    if (pincodeMatch) {
      candidates.push(pincodeMatch[1]);
    }
  }
  
  for (const candidate of candidates) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(candidate)}&limit=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'GauDhaam/1.0' } });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch {
      // continue to next candidate
    }
  }
  return null;
}

// Haversine formula for straight-line distance between two coordinates
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Pincode-based fallback delivery charge
function pincodeFallbackCharge(pincode: string): number {
  if (pincode.startsWith('380')) return 100;
  if (pincode.startsWith('36') || pincode.startsWith('39')) return 200;
  return 400;
}

export async function computeDeliveryCharge(address: string): Promise<{ charge: number; distanceKm: number; branchId?: string; method: string; baseFee: number; perKmRate: number; sourceAddress?: string; destAddress?: string }> {
  const { getDb } = await import('@/lib/firebase');
  const db = await getDb();
  
  // Extract pincode from address for fallback
  const pincodeMatch = address.match(/\b(\d{6})\b/);
  const pincode = pincodeMatch ? pincodeMatch[1] : '';
  
  if (!db) {
    const baseFee = 0;
    const perKmRate = 0;
    return { charge: pincodeFallbackCharge(pincode), distanceKm: 0, method: 'pincode-fallback', baseFee, perKmRate };
  }
  
  // Get delivery config (baseFee and perKmRate from admin)
  const configSnap = await db.collection('config').doc('delivery').get();
  const config = configSnap.exists ? configSnap.data() as any : { baseFee: 0, perKmRate: 0 };
  const baseFee = Number(config.baseFee || 0);
  const perKmRate = Number(config.perKmRate || 0);
  
  const branchesSnap = await db.collection('branches').get();
  const branches = branchesSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));
  
  if (branches.length === 0) {
    return { charge: pincodeFallbackCharge(pincode), distanceKm: 0, method: 'pincode-fallback', baseFee, perKmRate };
  }
  
  // Use the main branch (isMain: true) for distance calculation
  const mainBranch = branches.find(b => b.isMain === true) || branches[0];
  
  // Use stored branch coordinates (admin entered them)
  const branchCoords = { lat: mainBranch.lat, lng: mainBranch.lng };
  const branchAddress = mainBranch.address || '';
  
  // Geocode the user's delivery address (destination)
  let userCoords = null;
  let method = 'pincode-fallback';
  
  // Try Google Maps first for user address
  userCoords = await geocodeGoogle(address);
  
  if (userCoords && branchCoords.lat && branchCoords.lng) {
    // Use Distance Matrix API
    const dm = await distanceMatrixGoogle([branchCoords], userCoords);
    const element = dm.rows?.[0]?.elements?.[0];
    if (element && element.status === 'OK') {
      const distanceKm = element.distance.value / 1000;
      const charge = baseFee + distanceKm * perKmRate;
      return { charge: Math.round(charge), distanceKm, branchId: mainBranch.id, method: 'google-maps', baseFee, perKmRate, sourceAddress: branchAddress, destAddress: address };
    }
  }
  
  // Fallback: Try Nominatim (OpenStreetMap) geocoding for user address
  if (!userCoords) {
    userCoords = await geocodeNominatim(address);
  }
  
  if (userCoords && branchCoords.lat && branchCoords.lng) {
    const distanceKm = haversineDistance(branchCoords.lat, branchCoords.lng, userCoords.lat, userCoords.lng);
    // Apply a road distance factor (typically 1.3-1.5x straight-line distance)
    const roadDistanceKm = distanceKm * 1.4;
    const charge = baseFee + roadDistanceKm * perKmRate;
    return { charge: Math.round(charge), distanceKm: roadDistanceKm, branchId: mainBranch.id, method: 'nominatim-haversine', baseFee, perKmRate, sourceAddress: branchAddress, destAddress: address };
  }
  
  // Final fallback: pincode-based charges
  return { charge: pincodeFallbackCharge(pincode), distanceKm: 0, method: 'pincode-fallback', baseFee, perKmRate };
}
