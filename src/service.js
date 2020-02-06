
const Record = require('./record.js');

// Open mongo connection
require('./database.js');

async function updateRecord(user, emoji, count) {
  const record = await Record.findOne({ user, emoji });
  if (!record) {
    const newRecord = new Record({ user, emoji, count });
    newRecord.save();
    return;
  }
  record.count += count;
  record.save();
}

function recordEmoji(user, emojis) {
  const emojiCounts = [];
  emojis.forEach((emoji) => {
    if (Object.prototype.hasOwnProperty.call(emojiCounts, emoji)) {
      emojiCounts[emoji] += 1;
    } else {
      emojiCounts[emoji] = 1;
    }
  });
  Object.keys(emojiCounts).forEach((emoji) => {
    updateRecord(user, emoji, emojiCounts[emoji]);
  });
}

function getRecordsForEmoji(emoji) {
  return Record.find({ emoji })
    .sort({ count: 'descending' });
}

function getRecordsForUser(user) {
  return Record.find({ user })
    .sort({ count: 'descending' });
}

function getRecordsForUsers(users) {
  return Record.aggregate([
    { $match: { user: { $in: users } } },
    {
      $group: {
        _id: '$emoji',
        emoji: { $first: '$emoji' },
        count: { $sum: '$count' },
      },
    }])
    .sort({ count: 'descending' });
}

function getRecordsForAllUsers() {
  return Record.aggregate([
    {
      $group: {
        _id: '$emoji',
        emoji: { $first: '$emoji' },
        count: { $sum: '$count' },
      },
    }])
    .sort({ count: 'descending' });
}

module.exports = {
  recordEmoji,
  updateRecord,
  getRecordsForEmoji,
  getRecordsForUser,
  getRecordsForUsers,
  getRecordsForAllUsers,
};
