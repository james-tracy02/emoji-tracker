
const { recordEmoji } = require('../service/record.js');

module.exports = function (client) {
  return function (reaction, user) {
    recordEmoji(user.id, [reaction.emoji.id]);
  };
};
