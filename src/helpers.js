
const { RichEmbed } = require('discord.js');
const regexp = require('./regexp.js');
const recordService = require('./service/record.js');
const configs = require('./configs.js');

function setStatus(client) {
  client.user.setActivity(
    `emojis in ${client.guilds.size} servers!`,
    { type: 'WATCHING' });
}

function replaceNitroEmoji(msg) {
  let content = '';
  let index = 0;
  const matches = [...msg.content.matchAll(regexp.unrenderedEmojiGlobal)];
  if (matches.length === 0) return null;
  matches.forEach((match) => {
    const emojiObj = getEmojiByName(msg, match[1], match[2]);
    if (emojiObj) {
      content += msg.content.substring(index, match.index) + emojiObj.toString();
      index = match.index + match[0].length;
    }
  });
  content += msg.content.substring(index);
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

function getEmojiIds(content) {
  const matches = [...content.matchAll(regexp.renderedEmojiGlobal)]
  return matches.map((match) => match[1]);
}

function getEmojiByName(msg, name, index) {
  // fun feature?
  if(name === '?') {
    const emojiIds = Array.from(msg.client.emojis.keys());
    const randomId = emojiIds[Math.floor(Math.random() * emojiIds.length)];
    return msg.client.emojis.get(randomId);
  }
  let emojiObj;
  if (index) {
    const possibleEmojis = Array.from(msg.client.emojis.filter((emoji) => emoji.name === name));
    emojiObj = possibleEmojis[index - 1][1];
  } else {
    emojiObj = msg.guild.emojis.find((emoji) => emoji.name === name);
  }
  if (!emojiObj) emojiObj = msg.client.emojis.find((emoji) => emoji.name === name);
  return emojiObj;
}

function getEmojiObj(msg, emoji) {
  const matchRendered = emoji.match(regexp.renderedEmoji);
  if(matchRendered) {
    const emojiId = matchRendered[1];
    return msg.client.emojis.get(emojiId);
  }
  const matchUnrendered = emoji.match(regexp.unrenderedEmoji);
  if(matchUnrendered) {
    const name = matchUnrendered[1];
    const index = matchUnrendered[2];
    return getEmojiByName(msg, name, index);
  }
  const matchName = emoji.match(regexp.emojiName);
  if(matchName) {
    const name = matchName[1];
    const index = matchName[2];
    return getEmojiByName(msg, name, index);
  }
  return null;
}

function getUserIds(msg, user) {
  switch (user) {
    case 'me':
    case 'my':
      return [msg.author.id];
    case 'server':
      return Array.from(msg.guild.members.keys());
    case 'all':
      return []
    default:
      const match = user.match(regexp.userMention);
      if(match) return [match[1]];
      return null;
  }
}

function listEmoji(emojis, title, page) {
  const listEmbed = new RichEmbed()
    .setColor(configs.color)
    .setTitle(title);
  let content = '';
  const keys = Array.from(emojis.keys());
  const seen = {};
  for (let j = 0; j < (page - 1) * configs.resultsPerPage; j += 1) {
    const emoji = emojis.get(keys[j]);
    if (!emoji) break;
    if (seen[emoji.name]) {
      seen[emoji.name] += 1;
    } else {
      seen[emoji.name] = 1;
    }
  }
  for (let i = (page - 1) * configs.resultsPerPage; i < page * configs.resultsPerPage; i += 1) {
    const emoji = emojis.get(keys[i]);
    if (!emoji) break;
    content += emoji.toString();
    content += ` **:${emoji.name}`;
    if (seen[emoji.name]) {
      seen[emoji.name] += 1;
      content += `-${seen[emoji.name]}`;
    } else {
      seen[emoji.name] = 1;
    }
    content += `:** *${emoji.guild.name}*\n`;
  }
  content += '\n';
  content += `Page ${page} of ${Math.ceil(keys.length / configs.resultsPerPage)}.`;
  listEmbed.setDescription(content);
  return listEmbed;
}

module.exports = {
  setStatus,
  replaceNitroEmoji,
  msgOnBehalf,
  getEmojiObj,
  getUserIds,
  makeUserEmbed,
  getEmojiIds,
  listEmoji,
}
