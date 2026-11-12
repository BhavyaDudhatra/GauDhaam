import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyDJR8t41dcVSIz9J4QLKXf85zpJV6F1O0k';

async function geocode(address: string) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== 'OK' || !data.results[0]) return null;
  const loc = data.results[0].geometry.location;
  return { lat: loc.lat, lng: loc.lng };
}

async function distanceMatrix(origins: {lat:number,lng:number}[], destination:{lat:number,lng:number}) {
  const originsParam = origins.map(o => `${o.lat},${o.lng}`).join('|');
  const destParam = `${destination.lat},${destination.lng}`;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsParam}&destinations=${destParam}&units=metric&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  if (!address) return NextResponse.json({error:'address required'}, {status:400});
  
  const db = await getDb();
  if (!db) return NextResponse.json({charge:0, distance:0});
  const branchesSnap = await db.collection('branches').get();
  const branches = branchesSnap.docs.map(d=>({id:d.id,...d.data() as any}));
  if (branches.length === 0) return NextResponse.json({charge:0, distance:0});
  
  const dest = await geocode(address);
  if (!dest) return NextResponse.json({charge:0, distance:0});
  
  const origins = branches.map(b=>({lat:b.lat,lng:b.lng}));
  const dm = await distanceMatrix(origins, dest);
  
  let best = {distance:Infinity, branch:null as any};
  dm.rows?.forEach((row:any, i:number)=>{
    const element = row.elements[0];
    if (element.status === 'OK') {
      const meters = element.distance.value;
      if (meters < best.distance) {
        best = {distance:meters/1000, branch:branches[i]};
      }
    }
  });
  
  // Get delivery config
  const configSnap = await db.collection('config').doc('delivery').get();
  const config = configSnap.exists ? configSnap.data() as any : {baseFee:0, perKmRate:0};
  const baseFee = Number(config.baseFee||0);
  const perKmRate = Number(config.perKmRate||0);
  const distanceKm = best.distance;
  const charge = baseFee + distanceKm * perKmRate;
  
  return NextResponse.json({charge: Math.round(charge), distance: distanceKm, branchId: best.branch?.id});
}
