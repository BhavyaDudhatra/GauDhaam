import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';

const sa = JSON.parse(fs.readFileSync('./serviceAccount.json','utf8'));
initializeApp({ credential: cert(sa), projectId: sa.project_id });
const db = getFirestore();

async function smoke() {
  const col = db.collection('products');
  const doc = col.doc('smoke-test');
  await doc.set({ name: 'smoke', createdAt: FieldValue.serverTimestamp() });
  const snap = await doc.get();
  console.log('Read back:', snap.data());
  await doc.delete();
  console.log('Smoke test passed');
}
smoke().catch(e => { console.error(e); process.exit(1); });