const fs = require('fs');
const { google } = require('googleapis');
const path = 'C:/Users/Lenovo/Downloads/gaudhaam-ab2026-5e155089bdde.json';
const json = JSON.parse(fs.readFileSync(path,'utf8'));
const auth = new google.auth.JWT(json.client_email, null, json.private_key, ['https://www.googleapis.com/auth/drive']);
auth.authorize(async (err, tokens) => {
  if(err) { console.error('auth err', err); return; }
  console.log('authorized');
  const drive = google.drive({ version: 'v3', auth });
  drive.files.list({ q: "'1vpp_BZO3O_Og-znDLXJs5M2zV4XZjC-u' in parents", fields: 'files(id,name)' }, (e, res) => {
    if(e) console.error('list err', e);
    else console.log('files', res.data.files);
  });
});
