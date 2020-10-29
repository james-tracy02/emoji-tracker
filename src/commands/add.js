const helpers = require('../helpers');

function add(msg, args) {
  const emoji = args[0];
  const name = args[1];
  if(emoji) {
    const emojiObj = helpers.getEmojiObj(msg, emoji);
    if(emojiObj) {
      return addEmoji(msg, emojiObj, name);
    }
  }
  msg.channel.send('Invalid emoji.');
}

function addEmoji(msg, emoji, name) {
  if (msg.guild.emojis.has(emoji.id)) {
    return msg.channel.send(
      `This server already contains **${emoji.name}**!`,
    );
  }
  msg.guild.createEmoji(emoji.url, name || emoji.name);
  const addEmbed = helpers.makeUserEmbed(msg);
  addEmbed.setDescription(`Added **${emoji.name}** from **${emoji.guild.name}** to **${msg.guild.name}** as **${name || emoji.name}**.`);
  addEmbed.setImage(emoji.url);
  return msg.channel.send(addEmbed);
}

module.exports = add;
