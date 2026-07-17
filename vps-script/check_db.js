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
      let output = '';
      stream.on('close', (code, signal) => {
        resolve(output);
      }).on('data', (data) => {
        output += data.toString();
      }).stderr.on('data', (data) => {
        output += data.toString();
      });
    });
  });
};

conn.on('ready', async () => {
  try {
    console.log('--- Verificando Tabela de Produtos ---');
    const result = await runCommand('docker exec musicpro-ofertas-db psql -U user -d ofertasdb -c \'SELECT count(*), max("createdAt") FROM "Produto";\'');
    console.log(result);
  } catch (err) {
    console.error('Erro:', err);
  } finally {
    conn.end();
  }
}).connect(config);
