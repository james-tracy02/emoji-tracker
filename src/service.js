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

async function getRecordsForEmoji(emoji) {
  const records = await Record.find({ emoji: emoji })
                               .sort({ count: 'descending' });
  return records;
}

async function getRecordsForUser(user) {
  const records = await Record.find({ user: user })
                               .sort({ count: 'descending' });
  return records;
}

async function getRecordsForUsers(users) {
  const records = await Record.aggregate([
    { $match: { user: { $in: users } } },
    { $group: { _id: '$emoji',
                emoji: { $first: '$emoji'},
                count: { $sum: '$count' }}}])
  .sort({ count: 'descending' });

  return records;
}

async function getRecordsForAllUsers() {
  const records = await Record.aggregate([
    { $group: { _id: '$emoji',
                emoji: { $first: '$emoji'},
                count: { $sum: '$count' }}}])
  .sort({ count: 'descending' });

  return records;
}

module.exports = {
  updateRecord,
  getRecordsForEmoji,
  getRecordsForUser,
  getRecordsForUsers,
  getRecordsForAllUsers
};
