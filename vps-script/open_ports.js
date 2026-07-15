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
  console.log('Conexão SSH estabelecida com sucesso!');
  try {
    console.log('--- Abrindo portas no Firewall ---');
    await runCommand('ufw allow 3000/tcp');
    await runCommand('ufw allow 3001/tcp');
    await runCommand('iptables -I INPUT -p tcp --dport 3000 -j ACCEPT');
    await runCommand('iptables -I INPUT -p tcp --dport 3001 -j ACCEPT');
    await runCommand('iptables-save > /etc/iptables/rules.v4 || true');
    console.log('✅ Portas abertas!');
  } catch (err) {
    console.error('Erro:', err);
  } finally {
    conn.end();
  }
}).on('error', (err) => {
  console.error('Erro de SSH:', err);
}).connect(config);
