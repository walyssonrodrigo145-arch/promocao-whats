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
  const cmd = `docker exec musicpro-ofertas-api node -e "fetch('https://www.mercadolivre.com.br/social/dewalysson20210710001042?matt_word=dewalysson20210710001042&matt_tool=95359349&forceInApp=true&ref=BCzEsaCcGU9rT%2FcZbhWIiWH3xb2OL8G1oeBTko5CG2IoC2Ils9wO4eINJd93%2Bz7Jo7NqAZf6Wz0OhJdDfiP4aj2a3WQV%2BwDMmay8rq%2Fs%2FdYTBkWOmCsDTBAtmwj5I8F7gl9C18YftgQi3KVQe8hVH6UNtF2J%2BxX%2FeS6WJO4q6577t1Z4SjXyHSl3%2BDZc283rID%2Buig%3D%3D', {headers: {'User-Agent': 'Mozilla/5.0'}}).then(r=>console.log(r.status))"`;
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
