const regexp = require('./regexp');
const { RichEmbed } = require('discord.js');

function sortCountsDesc(counts) {
  counts.sort((a, b) => {
    const d = b.count - a.count
    if(d !== 0) {
      return d;
    } else {
      return b.emojiId - a.emojiId;
    }
  });
  return counts;
}

function timeToString(time) {
  return `${time.multiplier} ${time.unit.charAt(0).toUpperCase() + time.unit.slice(1)}${time.multiplier > 1 ? 's' : ''}`;
}

function parseTime(time) {
  if(!time) {
    return null;
  }
  const match = time.match(regexp.time);
  if(!match) {
    return null;
  }
  const multiplier = match[1] || 1;
  const unit = match[2];
  return {
    multiplier,
    unit,
  };
}

function getDate(time) {
  if(!time) {
    return null;
  }
  const now = new Date();

  switch (time.unit.toLowerCase()) {
    case 'hour':
      now.setHours(now.getHours() - time.multiplier);
      break;
    case 'day':
      now.setDate(now.getDate() - time.multiplier);
      break;
    case 'week':
      now.setDate(now.getDate() - time.multiplier * 7);
      break;
    case 'month':
      now.setMonth(now.getMonth() - time.multiplier);
      break;
    default:
      now = new Date(0);
  }
  return now.toISOString().slice(0, 19).replace('T', ' ');
}

async function addPageControls(msg) {
  await msg.react('⏮️');
  await msg.react('◀️');
  await msg.react('▶️');
  await msg.react('⏭️');
}

async function addGlobalToggle(msg) {
  await msg.react('🌎');
}

async function awaitMenuAction(msg, responseMsg, options, maxPages) {
  const filter = (reaction, user) => ['◀️', '▶️', '⏭️', '⏮️'].includes(reaction.emoji.name) && user.id === msg.author.id;
  const collected = await responseMsg.awaitReactions(filter,  { max: 1, time: 30000 });
  options.msg = responseMsg;
  const reaction = collected.first();
  if(!reaction) {
    return;
  }
  if(reaction.emoji.name === '▶️') {
    options.page = Math.min(options.page + 1, maxPages);
  } else if(reaction.emoji.name === '◀️') {
    options.page = Math.max(options.page - 1, 1);
  } else if(reaction.emoji.name === '⏭️') {
    options.page = maxPages;
  } else if(reaction.emoji.name === '⏮️') {
    options.page = 1;
  }
  reaction.remove(msg.author.id);
  return options;
}

async function awaitMenuActionWithGlobal(msg, responseMsg, options, maxPages) {
  const filter = (reaction, user) => ['◀️', '▶️', '⏭️', '⏮️', '🌎'].includes(reaction.emoji.name) && user.id === msg.author.id;
  const collected = await responseMsg.awaitReactions(filter,  { max: 1, time: 30000 });
  options.msg = responseMsg;
  const reaction = collected.first();
  if(!reaction) {
    return;
  }
  if(reaction.emoji.name === '▶️') {
    options.page = Math.min(options.page + 1, maxPages);
  } else if(reaction.emoji.name === '◀️') {
    options.page = Math.max(options.page - 1, 1);
  } else if(reaction.emoji.name == '🌎') {
    options.global = !options.global;
    options.page = 1;
  } else if(reaction.emoji.name === '⏭️') {
    options.page = maxPages;
  } else if(reaction.emoji.name === '⏮️') {
    options.page = 1;
  }
  reaction.remove(msg.author.id);
  return options;
}

function flattenRecordsByEmoji(records) {
  return flattenRecordsByField(records, 'emojiId');
}

function flattenRecordsByUser(records) {
  return flattenRecordsByField(records, 'userId');
}

function flattenRecordsByField(records, fieldName) {
  const flattened = {};
  const counts = [];
  for(let i = 0; i < records.length; i++) {
    const field = records[i][fieldName];
    if(!flattened[field]) {
      flattened[field] = 1;
    } else {
      flattened[field] += 1;
    }
  }
  for (let key of Object.keys(flattened)) {
    counts.push({[fieldName]: key, count: flattened[key]});
  }
  return counts;
}

function getEmojiByName(msg, name, index) {
  if (name === '?') {
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

function makeUserEmbed(member) {
  const color = member.displayHexColor;
  return new RichEmbed()
    .setColor(color === '#000000' ? '#FEFEFE' : color)
    .setAuthor(member.displayName, member.user.avatarURL);
}

function getEmojiObj(msg, emoji) {
  const matchRendered = emoji.match(regexp.renderedEmoji);
  if (matchRendered) {
    const emojiId = matchRendered[1];
    return msg.client.emojis.get(emojiId);
  }
  const matchUnrendered = emoji.match(regexp.unrenderedEmoji);
  if (matchUnrendered) {
    const name = matchUnrendered[1];
    const index = matchUnrendered[2];
    return getEmojiByName(msg, name, index);
  }
  const matchName = emoji.match(regexp.emojiName);
  if (matchName) {
   const name = matchName[1];
   const index = matchName[2];
   return getEmojiByName(msg, name, index);
  }
  return null;
}

module.exports = {
  sortCountsDesc,
  getDate,
  addPageControls,
  addGlobalToggle,
  awaitMenuAction,
  awaitMenuActionWithGlobal,
  flattenRecordsByEmoji,
  flattenRecordsByUser,
  parseTime,
  timeToString,
  getEmojiByName,
  makeUserEmbed,
  getEmojiObj,
}
