import fs from 'fs';
const envPath = './.env.local';
let content = fs.readFileSync(envPath, 'utf8');
const sa = JSON.parse(fs.readFileSync('./serviceAccount.json', 'utf8'));
// Escape for .env value with \n literals
const escKey = sa.private_key.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
content = content.replace(/^FIREBASE_PROJECT_ID=.*$/m, `FIREBASE_PROJECT_ID="${sa.project_id}"`);
content = content.replace(/^FIREBASE_CLIENT_EMAIL=.*$/m, `FIREBASE_CLIENT_EMAIL="${sa.client_email}"`);
content = content.replace(/^FIREBASE_PRIVATE_KEY=.*$/m, `FIREBASE_PRIVATE_KEY="${escKey}"`);
fs.writeFileSync(envPath, content);
console.log('env updated');