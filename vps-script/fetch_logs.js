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
  console.log('--- Fetching API Logs ---');
  conn.exec('cd /root/promocao-whats && docker logs musicpro-ofertas-api --tail 100', (err, stream) => {
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
