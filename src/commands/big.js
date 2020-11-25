const helpers = require('../helpers');
const emojiManager = require('../emojiManager');

function big(msg, emoji) {
  msg.delete().catch(err => console.error(err));
  const emojiObj = helpers.getEmojiObj(msg, emoji);
  if (!emojiObj) {
    msg.channel.send('Invalid emoji.');
    return;
  }
  helpers.msgOnBehalf(msg, "", msg.author.id, emojiObj.url);
  emojiManager.countIds(msg.author.id, [emojiObj.id], msg.guild.id);
}

module.exports = big;
