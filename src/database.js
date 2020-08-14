const mysql = require('mysql');
const pool = mysql.createPool(process.env.JAWSDB_URL);

/*
setInterval(ping, 3600000);

function ping() {
  pool.query('SELECT 1;', (err) => {
    if(err) {
      console.log(err);
    }
  });
}
*/

module.exports = pool;
