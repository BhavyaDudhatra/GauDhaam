const fs = require('fs');
const path = 'C:/Users/Lenovo/Downloads/gaudhaam-ab2026-5e155089bdde.json';
console.log('exists', fs.existsSync(path));
const json = JSON.parse(fs.readFileSync(path,'utf8'));
console.log('email', json.client_email);
console.log('key start', json.private_key.slice(0,30));
