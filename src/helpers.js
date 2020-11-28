const regexp = require('./regexp');
const { MessageEmbed } = require('discord.js');
const configs = require('./configs');

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
  let now = new Date();

  switch (time.unit.toLowerCase()) {
    case 'minute':
      now.setMinutes(now.getMinutes() - time.multiplier);
      break;
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

async function addViewControls(msg) {
  await msg.react('🌎');
  await msg.react('0️⃣');
}

async function awaitMenuAction(msg, responseMsg, options, maxPages) {
  const filter = (reaction, user) => ['◀️', '▶️', '⏭️', '⏮️'].includes(reaction.emoji.name) && user.id === msg.author.id;
  const collected = await responseMsg.awaitReactions(filter,  { max: 1, time: configs.reactionTimeout });
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
  //reaction.remove(msg.author.id);
  return options;
}

async function awaitMenuActionWithViews(msg, responseMsg, options, maxPages) {
  const filter = (reaction, user) => ['◀️', '▶️', '⏭️', '⏮️', '🌎', '0️⃣'].includes(reaction.emoji.name) && user.id === msg.author.id;
  const collected = await responseMsg.awaitReactions(filter,  { max: 1, time: configs.reactionTimeout });
  options.msg = responseMsg;
  const reaction = collected.first();
  if(!reaction) {
    return;
  }
  switch (reaction.emoji.name) {
    case '▶️':
      options.page = Math.min(options.page + 1, maxPages);
      break;
    case '◀️':
      options.page = Math.max(options.page - 1, 1);
      break;
    case '🌎':
      options.global = !options.global;
      options.page = 1;
      break;
    case '⏭️':
      options.page = maxPages;
      break;
    case '⏮️':
      options.page = 1;
      break;
    case '0️⃣':
      options.showUnused = !options.showUnused;
      options.page = 1;
      break;
  }
  //reaction.remove(msg.author.id);
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
    const emojiIds = Array.from(msg.client.emojis.cache.keys());
    const randomId = emojiIds[Math.floor(Math.random() * emojiIds.length)];
    return msg.client.emojis.cache.get(randomId);
  }
  let emojiObj;
  if (index) {
    const possibleEmojis = Array.from(msg.client.emojis.cache.filter((emoji) => emoji.name === name));
    emojiObj = possibleEmojis[index - 1][1];
  } else {
    emojiObj = msg.guild.emojis.cache.find((emoji) => emoji.name === name);
  }
  if (!emojiObj) emojiObj = msg.client.emojis.cache.find((emoji) => emoji.name === name);
  return emojiObj;
}

function makeUserEmbed(msg) {
  return new MessageEmbed()
    .setColor('#FEFEFE')
    .setAuthor(msg.author.username);
}

function makeMemberEmbed(member) {
  const color = member.displayHexColor;
  return new MessageEmbed()
    .setColor(color === '#000000' ? '#FEFEFE' : color)
    .setAuthor(member.displayName, member.user.avatarURL);
}

function getEmojiObj(msg, emoji) {
  const matchRendered = emoji.match(regexp.renderedEmoji);
  if (matchRendered) {
    const emojiId = matchRendered[1];
    return msg.client.emojis.cache.get(emojiId);
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

function msgOnBehalf(msg, content, user, img) {
  const sendFunc = (webhook) => {
    const ops = { username: msg.member.displayName, avatarURL: msg.author.displayAvatarURL() };
    if(img) {
      ops.embeds = [{ color: "#36393F", image: { url: img }}]
    }
    webhook.send(content, ops);
  };
  msg.channel.fetchWebhooks()
  .then(webhooks => {
    const webhook = webhooks.find(webhook => webhook.name = configs.webhookName);
    if(!webhook) {
      msg.channel.createWebhook(configs.webhookName)
      .then(sendFunc);
    } else {
      sendFunc(webhook);
    }
  });
}

async function list(msg, title, items, options) {
  if(!options) {
    options = {
      page: 1,
    };
  }
  const maxPages = Math.ceil(items.length / configs.resultsPerPage);
  const start = (options.page - 1) * configs.resultsPerPage;
  const end = start + configs.resultsPerPage;
  const pageItems = items.slice(start, end);

  let response = "";
  pageItems.forEach((item) => response += `**${item}**\n`);
  response += `\n Page ${options.page} of ${maxPages}.`;

  const embed = new MessageEmbed()
  .setColor(configs.color)
  .setTitle(title)
  .setDescription(response);

  let responseMsg;
  if(options.msg) {
    responseMsg = await options.msg.edit(embed);
  } else {
    responseMsg = await msg.channel.send(embed);
  }
  if(!options.msg) {
    await addPageControls(responseMsg);
  }
  const newOptions = await awaitMenuAction(msg, responseMsg, options, maxPages);
  if(!newOptions) {
    return;
  }
  return list(msg, title, items, newOptions);
}

module.exports = {
  sortCountsDesc,
  getDate,
  addPageControls,
  addViewControls,
  awaitMenuAction,
  awaitMenuActionWithViews,
  flattenRecordsByEmoji,
  flattenRecordsByUser,
  parseTime,
  timeToString,
  getEmojiByName,
  makeUserEmbed,
  getEmojiObj,
  makeMemberEmbed,
  msgOnBehalf,
  list,
}
