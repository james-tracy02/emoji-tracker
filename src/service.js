'use strict';

const Record = require('./record.js');

// Open mongo connection
require('./database.js');

async function updateRecord(user, emoji, count) {
  const record = await Record.findOne({ user: user, emoji: emoji });
  if(!record) {
    const newRecord = new Record({ user: user, emoji: emoji, count: count});
    newRecord.save();
    return;
  }
  record.count += count;
  record.save();
  return;
}

function getRecordsForEmoji(emoji) {
  return Record.find({ emoji: emoji })
               .sort({ count: 'descending' });
}

function getRecordsForUser(user) {
  return Record.find({ user: user })
               .sort({ count: 'descending' });
}

function getRecordsForUsers(users) {
  return Record.aggregate([
    { $match: { user: { $in: users } } },
    { $group: { _id: '$emoji',
                emoji: { $first: '$emoji'},
                count: { $sum: '$count' }}}])
  .sort({ count: 'descending' });
}

function getRecordsForAllUsers() {
  return Record.aggregate([
    { $group: { _id: '$emoji',
                emoji: { $first: '$emoji'},
                count: { $sum: '$count' }}}])
  .sort({ count: 'descending' });
}

module.exports = {
  updateRecord,
  getRecordsForEmoji,
  getRecordsForUser,
  getRecordsForUsers,
  getRecordsForAllUsers
};
