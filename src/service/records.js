const pool = require('../database');
const TABLE_NAME = 'records';

function getRecordsForUser(userId, time, callback) {
  pool.getConnection((err, connection) => {
    if (err) {
      connection.release();
      throw err;
    }
    connection.query(`SELECT * FROM ${TABLE_NAME} WHERE userId = ${userId} AND time >= ?`, [time],
      (err, result) => {
        connection.release();
        if(err) {
          console.log("Failed to retrieve emoji data.");
          throw err;
        } else {
          console.log('Retrieved records for user.')
          callback(result);
        }
      });
  });
}

function getRecordsForUsers(userIds, time, callback) {
  pool.getConnection((err, connection) => {
    if (err) {
      connection.release();
      throw err;
    }
    connection.query(`SELECT * FROM ${TABLE_NAME} WHERE userId IN (${userIds}) AND time >= ?`, [time],
      (err, result) => {
        connection.release();
        if(err) {
          console.log("Failed to retrieve emoji data.");
          throw err;
        } else {
          console.log('Retrieved records for users.')
          callback(result);
        }
      });
  });
}

function getAllRecords(time, callback) {
  pool.getConnection((err, connection) => {
    if (err) {
      connection.release();
      throw err;
    }
    connection.query(`SELECT * FROM ${TABLE_NAME} WHERE time >= ?`, [time],
      (err, result) => {
        connection.release();
        if(err) {
          console.log("Failed to retrieve emoji data.");
          throw err;
        } else {
          console.log('Retrieved records for all users.')
          callback(result);
        }
      });
  });
}

function getRecordsForEmoji(emojiId, time, callback) {
  pool.getConnection((err, connection) => {
    if (err) {
      connection.release();
      throw err;
    }
    connection.query(`SELECT * FROM ${TABLE_NAME} WHERE emojiId = ${emojiId} AND time >= ?`, [time],
      (err, result) => {
        connection.release();
        if(err) {
          console.log("Failed to retrieve user data.");
          throw err;
        } else {
          console.log('Retrieved records for emoji.')
          callback(result);
        }
      });
    });
}

function insertRecords(emojiIds, userId, time) {
  const values = [];
  emojiIds.forEach(emojiId => {
    values.push([userId, emojiId, time]);
  });
  pool.getConnection((err, connection) => {
    if (err) {
      connection.release();
      throw err;
    }
    connection.query(`INSERT INTO ${TABLE_NAME} VALUES ?`, [values],
        err => {
          connection.release();
          if(err) {
            console.log("Failed to insert emoji data.");
            throw err;
          }
      });
  });
}

module.exports = {
  getRecordsForUser,
  getRecordsForUsers,
  getAllRecords,
  getRecordsForEmoji,
  insertRecords,
};
