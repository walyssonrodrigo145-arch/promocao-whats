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
  const cmd = `docker exec musicpro-ofertas-api node -e "
    (async () => {
      const url = 'https://meli.la/2dbz95n';
      let finalUrl = url;
      const response = await fetch(url, { redirect: 'manual', headers: {'User-Agent': 'Mozilla/5.0'} });
      if (response.status >= 300 && response.status < 400) {
        finalUrl = response.headers.get('location') || url;
      }
      console.log('Final URL:', finalUrl);
      
      const socialResponse = await fetch(finalUrl, { headers: {'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'} });
      if (socialResponse.ok) {
        const html = await socialResponse.text();
        const idx = html.indexOf('MLB');
        console.log('Context:', html.substring(idx-30, idx+60));
        const htmlMatch = html.match(/MLB-?(\d+)/i);
        console.log('Match:', htmlMatch ? htmlMatch[1] : 'null');
      } else {
        console.log('Social response not ok:', socialResponse.status);
      }
    })();
  "`;
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
