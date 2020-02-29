
const { recordEmoji } = require('../service/record.js');

module.exports = function (alterEgo) {
  return function (reaction, user) {
    if(!user.bot) recordEmoji(user.id, [reaction.emoji.id]);
  };
};
