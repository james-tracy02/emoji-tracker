const helpers = require('../helpers');

function add(msg, emoji, name) {
  if(emoji) {
    const emojiObj = helpers.getEmojiObj(msg, emoji);
    if(emojiObj) {
      return addEmoji(msg, emojiObj, name);
    }
  }
  msg.channel.send('Invalid emoji.');
}

function addEmoji(msg, emoji, name) {
  if (msg.guild.emojis.cache.has(emoji.id)) {
    return msg.channel.send(
      `This server already contains **${emoji.name}**!`,
    );
  }
  msg.guild.createEmoji(emoji.url, name || emoji.name);
  const addEmbed = helpers.makeMemberEmbed(msg.member);
  addEmbed.setDescription(`Added **${emoji.name}** from **${emoji.guild.name}** to **${msg.guild.name}** as **${name || emoji.name}**.`);
  addEmbed.setImage(emoji.url);
  return msg.channel.send(addEmbed);
}

module.exports = add;
