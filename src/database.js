const mysql = require('mysql');

function establishConnection(connection) {
  connection.conn = mysql.createConnection(process.env.JAWSDB_URL);
  connection.conn.connect(function(err) {
    if(err) {
      console.log('error when connecting to db:', err);
      setTimeout(() => establishConnection(connection), 2000);
    }
  });

  connection.conn.on('error', function(err) {
    console.log('db error', err);
    establishConnection(connection);
  });
}

module.exports = {
  establishConnection,
};
