import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';
const sa = JSON.parse(fs.readFileSync('./serviceAccount.json','utf8'));
initializeApp({credential:cert(sa), projectId:sa.project_id});
const db = getFirestore();
await db.collection('complementary_gifts').doc('_init').set({createdAt: FieldValue.serverTimestamp()});
await db.collection('complementary_gifts').doc('_init').delete();
console.log('complementary_gifts ready');
