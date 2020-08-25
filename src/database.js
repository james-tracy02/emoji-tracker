const mysql = require('mysql');
const pool = mysql.createPool(process.env.JAWSDB_URL);
pool.connectionLimit = 10;
pool.connectTimeout = 60 * 1000;

module.exports = pool;
