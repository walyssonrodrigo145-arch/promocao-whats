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
    console.log('--- Fazendo Upload do arquivo .env (Segurança) ---');
    await new Promise((resolve, reject) => {
      conn.sftp((err, sftp) => {
        if (err) return reject(err);
        
        // Ensure directory exists before upload
        conn.exec('mkdir -p /root/promocao-whats/backend', (err, stream) => {
          stream.on('close', () => {
             sftp.fastPut('./backend/.env', '/root/promocao-whats/backend/.env', (err) => {
                if (err) return reject(err);
                console.log('✅ Arquivo .env enviado com sucesso!');
                resolve();
             });
          });
        });
      });
    });

    console.log('--- Instalando dependências na VPS ---');
    await runCommand('curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh');
    await runCommand('apt-get install docker-compose-plugin -y');

    console.log('--- Clonando repositório ou atualizando ---');
    await runCommand('if [ -d "promocao-whats" ]; then cd promocao-whats && git pull; else git clone https://github.com/walyssonrodrigo145-arch/promocao-whats.git; fi');

    console.log('--- Subindo Docker Compose ---');
    await runCommand('cd promocao-whats && docker compose up -d --build');

    console.log('✅ Deploy finalizado com sucesso!');
  } catch (err) {
    console.error('Erro durante o deploy:', err);
  } finally {
    conn.end();
  }
}).on('error', (err) => {
  console.error('Erro de SSH:', err);
}).connect(config);
