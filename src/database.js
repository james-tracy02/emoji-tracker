const mysql = require('mysql');
const connection = mysql.createConnection(process.env.JAWSDB_URL);

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

setInterval(ping, 10000)

function ping() {
  connection.query('SELECT 1;', (err) => {
    if(err) {
      console.log(err);
    }
  });
}

module.exports = connection;
