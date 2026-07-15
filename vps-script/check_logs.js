const { Client } = require('ssh2');

const conn = new Client();

const config = {
  host: '76.13.228.159',
  port: 22,
  username: 'root',
  password: 'Walysson2003@',
  readyTimeout: 60000,
};

const runCommand = (cmd) => {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      stream.on('close', (code, signal) => {
        resolve({ code, signal });
      }).on('data', (data) => {
        process.stdout.write(data.toString());
      }).stderr.on('data', (data) => {
        process.stderr.write(data.toString());
      });
    });
  });
};

conn.on('ready', async () => {
  try {
    console.log('--- Verificando Docker PS ---');
    await runCommand('docker ps -a');
    console.log('--- Verificando Logs da API ---');
    await runCommand('docker logs musicpro-ofertas-api --tail 50');
  } catch (err) {
    console.error('Erro:', err);
  } finally {
    conn.end();
  }
}).connect(config);
