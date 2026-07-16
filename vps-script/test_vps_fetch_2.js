const { Client } = require('ssh2');
const fs = require('fs');

const sshConfig = {
  host: '76.13.228.159',
  port: 22,
  username: 'root',
  password: 'Walysson2003@',
};

const conn = new Client();

conn.on('ready', () => {
  console.log('--- Testing Fetch on VPS ---');
  const cmd = `docker exec musicpro-ofertas-api node -e "fetch('https://meli.la/2dbz95n', {redirect: 'manual', headers: {'User-Agent': 'Mozilla/5.0'}}).then(r=>console.log(r.status, r.headers.get('location')))"`;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).connect(sshConfig);
