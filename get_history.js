const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
fs.copyFileSync('robo-garimpeiro/perfil_chrome_robo/Default/History', 'robo-garimpeiro/History_copy');
const db = new sqlite3.Database('robo-garimpeiro/History_copy');
db.serialize(() => {
  db.all("SELECT url, title FROM urls WHERE url LIKE '%mercadolivre.com.br%' ORDER BY last_visit_time DESC LIMIT 50", (err, rows) => {
    if (err) console.error(err);
    else console.log(JSON.stringify(rows, null, 2));
  });
});
