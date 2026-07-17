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
  console.log('🔗 Conectado na VPS!');
  try {
    console.log('🧹 Limpando todos os produtos da Lojinha Virtual via Postgres nativo...');
    await runCommand('docker exec musicpro-ofertas-db psql -U user -d ofertasdb -c "TRUNCATE TABLE \\"Produto\\" CASCADE;"');
    
    console.log('🧹 Limpando Cache do Redis...');
    await runCommand('docker exec musicpro-ofertas-redis redis-cli FLUSHALL');

    console.log('🔄 Reiniciando API e Frontend (limpando cache do Next.js)...');
    await runCommand('docker restart musicpro-ofertas-web musicpro-ofertas-api');

    console.log('✅ Banco e Cache zerados com sucesso! A lojinha está limpa.');
  } catch (err) {
    console.error('Erro:', err);
  } finally {
    conn.end();
  }
}).on('error', (err) => {
  console.error('Erro de SSH:', err);
}).connect(config);
