const regexp = require('./regexp');
const records = require('./service/records');
const { RichEmbed } = require('discord.js');
const helpers = require('./helpers');

function count(userId, content) {
    const matches = [...content.matchAll(regexp.emoji)];
    const emojiIds = [];
    matches.forEach((match) => {
      const emojiId = match[1];
      emojiIds.push(emojiId);
    });
    if(emojiIds.length > 0) {
      records.insertRecords(emojiIds, userId, new Date().toISOString().slice(0, 19).replace('T', ' '));
    }
}

function enrich(msg) {
  let content = '';
  let index = 0;
  let count = 0;
  const matches = [...msg.content.matchAll(regexp.unrenderedEmojiGlobal)];
  if (matches.length === 0) return null;
  matches.forEach((match) => {
    const emojiObj = helpers.getEmojiByName(msg, match[1], match[2]);
    if (emojiObj) {
      content += msg.content.substring(index, match.index) + emojiObj.toString();
      index = match.index + match[0].length;
      count ++;
    }
  });
  content += msg.content.substring(index);
  if(count === 0) return null;
  return content;
}

async function msgOnBehalf(msg, content, user) {
  msg.delete();
  const userEmbed = makeUserEmbed(msg.member);
  await msg.channel.send(userEmbed);
  msg.channel.send(content);
}

function makeUserEmbed(member) {
  const color = member.displayHexColor;
  return new RichEmbed()
    .setColor(color === '#000000' ? '#FEFEFE' : color)
    .setAuthor(member.displayName, member.user.avatarURL);
}

module.exports = {
  count,
  enrich,
  msgOnBehalf,
};
