
const { recordEmoji } = require('../service/record.js');

module.exports = function (alterEgo) {
  return function (reaction, user) {
    recordEmoji(user.id, [reaction.emoji.id]);
  };
};
