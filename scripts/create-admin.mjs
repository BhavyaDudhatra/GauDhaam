import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import crypto from 'crypto';

const sa = JSON.parse(fs.readFileSync('./serviceAccount.json','utf8'));
initializeApp({ credential: cert(sa), projectId: sa.project_id });
const db = getFirestore();

function getEnv(key) {
  const env = fs.readFileSync('.env.local','utf8');
  const m = env.match(new RegExp(`^${key}=(.*)$`,`m`));
  if (!m) return '';
  let v = m[1].trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1,-1).replace(/\\n/g,'\n');
  return v;
}

const ADMIN_EMAIL = getEnv('ADMIN_EMAIL') || 'admin@gaudhaam.in';
const ADMIN_PASSWORD = getEnv('ADMIN_PASSWORD') || 'gaudhaam@123';
const ADMIN_NAME = 'GauDhaam Admin';

function hashPassword(p) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(p, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  const usersCol = db.collection('users');
  const q = await usersCol.where('email','==',ADMIN_EMAIL).get();
  if (!q.empty) {
    console.log('Admin already exists');
    return;
  }
  const id = crypto.randomUUID();
  const passwordHash = hashPassword(ADMIN_PASSWORD);
  await usersCol.doc(id).set({
    id,
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    phone: '',
    passwordHash,
    role: 'admin',
    emailVerified: true,
    createdAt: new Date().toISOString(),
  });
  console.log('Admin created:', ADMIN_EMAIL, ADMIN_PASSWORD);
}
main().catch(e=>{console.error(e);process.exit(1);});
