
const helpers = require('../helpers.js');
const { recordEmoji } = require('../service/record.js');

module.exports = function (alterEgo) {
  return function (msg) {
    if (msg.author.bot || msg.content.startsWith(alterEgo.prefix)) return;
    const res = helpers.replaceNitroEmoji(msg);
    if (res) helpers.msgOnBehalf(msg, res, msg.author);
    const emoji = helpers.getEmojiIds(res || msg.content);
    recordEmoji(msg.author.id, emoji);
  };
};
