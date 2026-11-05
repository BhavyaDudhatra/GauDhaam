import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pincode = url.searchParams.get('pincode') || '';
  const db = await getDb();
  let charge = 400; // default
  if (db && pincode) {
    const snap = await db.collection('delivery_zones').get();
    let bestMatch: any = null;
    let bestLen = -1;
    snap.forEach(doc=>{
      const data = doc.data();
      const prefix = String(data.pincodePrefix||'');
      if (pincode.startsWith(prefix) && prefix.length > bestLen) {
        bestLen = prefix.length;
        bestMatch = data;
      }
    });
    if (bestMatch && typeof bestMatch.charge === 'number') {
      charge = bestMatch.charge;
    } else {
      // fallback rules
      if (pincode.startsWith('380')) charge = 100;
      else if (pincode.startsWith('36') || pincode.startsWith('39')) charge = 200; // rough Gujarat
      else charge = 400;
    }
  } else {
    // fallback without db
    if (pincode.startsWith('380')) charge = 100;
    else if (pincode.startsWith('36') || pincode.startsWith('39')) charge = 200;
    else charge = 400;
  }
  return NextResponse.json({ charge });
}
