const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyDJR8t41dcVSIz9J4QLKXf85zpJV6F1O0k';

async function geocode(address: string) {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== 'OK' || !data.results?.[0]) return null;
    const loc = data.results[0].geometry.location;
    return { lat: loc.lat, lng: loc.lng };
  } catch {
    return null;
  }
}

async function distanceMatrix(origins: {lat:number,lng:number}[], destination:{lat:number,lng:number}) {
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

// Pincode-based fallback delivery charge
function pincodeFallbackCharge(pincode: string): number {
  if (pincode.startsWith('380')) return 100;
  if (pincode.startsWith('36') || pincode.startsWith('39')) return 200;
  return 400;
}

export async function computeDeliveryCharge(address: string): Promise<{ charge: number; distanceKm: number; branchId?: string; method: string }> {
  const { getDb } = await import('@/lib/firebase');
  const db = await getDb();
  
  // Extract pincode from address for fallback
  const pincodeMatch = address.match(/\b(\d{6})\b/);
  const pincode = pincodeMatch ? pincodeMatch[1] : '';
  
  if (!db) {
    // No DB - use pincode fallback
    const baseFee = 0;
    const perKmRate = 0;
    return { charge: pincodeFallbackCharge(pincode), distanceKm: 0, method: 'pincode-fallback' };
  }
  
  // Get delivery config
  const configSnap = await db.collection('config').doc('delivery').get();
  const config = configSnap.exists ? configSnap.data() as any : { baseFee: 0, perKmRate: 0 };
  const baseFee = Number(config.baseFee || 0);
  const perKmRate = Number(config.perKmRate || 0);
  
  const branchesSnap = await db.collection('branches').get();
  const branches = branchesSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));
  
  if (branches.length === 0) {
    // No branches - use pincode fallback with config
    return { charge: pincodeFallbackCharge(pincode), distanceKm: 0, method: 'pincode-fallback' };
  }
  
  // Try Google Maps geocoding
  const dest = await geocode(address);
  if (!dest) {
    // Geocoding failed - use pincode fallback
    return { charge: pincodeFallbackCharge(pincode), distanceKm: 0, method: 'pincode-fallback' };
  }
  
  const origins = branches.map(b => ({ lat: b.lat, lng: b.lng }));
  const dm = await distanceMatrix(origins, dest);
  
  let bestDistance = Infinity;
  let bestBranchId: string | undefined;
  let mapsWorked = false;
  
  dm.rows?.forEach((row: any, i: number) => {
    const element = row.elements?.[0];
    if (element && element.status === 'OK') {
      const meters = element.distance.value;
      if (meters < bestDistance) {
        bestDistance = meters / 1000;
        bestBranchId = branches[i]?.id;
        mapsWorked = true;
      }
    }
  });
  
  if (!mapsWorked) {
    // Distance Matrix failed - use pincode fallback
    return { charge: pincodeFallbackCharge(pincode), distanceKm: 0, method: 'pincode-fallback' };
  }
  
  const distanceKm = bestDistance === Infinity ? 0 : bestDistance;
  const charge = baseFee + distanceKm * perKmRate;
  
  return { charge: Math.round(charge), distanceKm, branchId: bestBranchId, method: 'google-maps' };
}
