const helpers = require('../helpers');
const emojiManager = require('../emojiManager');

function big(msg, args) {
  msg.delete();
  const emojiObj = helpers.getEmojiObj(msg, args[0]);
  if (!emojiObj) {
    msg.channel.send('Invalid emoji.');
    return;
  }
  const bigEmbed = helpers.makeMemberEmbed(msg.member);
  bigEmbed.setImage(emojiObj.url);
  msg.channel.send(bigEmbed);
  emojiManager.countIds(msg.author.id, [emojiObj.id]);
}

module.exports = big;
