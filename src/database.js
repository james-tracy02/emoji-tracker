const mysql = require('mysql');
const pool = mysql.createPool(process.env.JAWSDB_URL);

module.exports = pool;
