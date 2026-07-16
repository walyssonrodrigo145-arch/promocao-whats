const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const caddyConfig = `wrmusicpro.com.br, www.wrmusicpro.com.br {
    reverse_proxy app:3000
}

escola.wrmusicpro.com.br {
    root * /srv/landpage
    file_server
}

promo.wrmusicpro.com.br {
    handle /api/* {
        reverse_proxy 76.13.228.159:3000
    }
    handle /collector/* {
        reverse_proxy 76.13.228.159:3000
    }
    handle /* {
        reverse_proxy 76.13.228.159:3001
    }
}`;

  conn.exec(`docker exec wr-music-app-caddy-1 sh -c "echo '${caddyConfig}' > /etc/caddy/Caddyfile && caddy reload --config /etc/caddy/Caddyfile"`, (err, stream) => {
    let output = '';
    stream.on('data', (data) => output += data).on('close', () => {
      console.log('Caddy update output: ', output);
      conn.end();
    });
    stream.stderr.on('data', (data) => {
      console.error('Caddy update error: ', data.toString());
    });
  });
}).connect({
  host: '76.13.228.159',
  port: 22,
  username: 'root',
  password: 'Walysson2003@'
});
