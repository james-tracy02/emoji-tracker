const records = require('../service/records');
const print = require('../print');
const regexp = require('../regexp');
const helpers = require ('../helpers');
const configs = require('../configs');

function emoji(msg, args) {
  const user = args[0];
  const time = helpers.parseTime(args[1]);
  let match;
  if(user) {
    match = user.match(regexp.userMention);
  }
  if(!user) {
    displayEmojiForUser(msg, msg.author, time);
  }
  else if(user.toLowerCase() === "server") {
    displayEmojiForGuild(msg, msg.channel.guild, time);
  }
  else if(user.toLowerCase() === "all") {
    displayEmojiForAll(msg, time);
  }
  else if(match) {
    const userObj = msg.channel.guild.members.get(match[1]);
    if(userObj) {
      displayEmojiForUser(msg, userObj, time);
    } else {
      msg.channel.send("Invalid user.");
    }
  }
  else {
    const userObj = msg.client.users.find(targetUser => targetUser.displayName === user || targetUser.username === user);
    if(userObj) {
      displayEmojiForUser(msg, userObj, time);
    } else {
      msg.channel.send("Invalid user.");
    }
  }
}

function displayEmojiForUser(msg, user, time) {
  const emojiCounts = records.getRecordsForUser(user.id, helpers.getDate(time))
  .then(records => {
    const emojiCounts = helpers.flattenRecordsByEmoji(records);
    const member = msg.guild.member(user);
    displayEmoji(msg, member.nickname, time, emojiCounts);
  });
}

function displayEmojiForGuild(msg, guild, time) {
  const guildId = guild.id;
  const emojiCounts = records.getRecordsForGuild(guildId, helpers.getDate(time))
  .then(records => {
    const emojiCounts = helpers.flattenRecordsByEmoji(records);
    displayEmoji(msg, guild.name, time, emojiCounts);
  });
}

function displayEmojiForAll(msg, time) {
  const emojiCounts = records.getAllRecords(helpers.getDate(time))
  .then(records => {
    const emojiCounts = helpers.flattenRecordsByEmoji(records);
    displayEmoji(msg, "All Users", time, emojiCounts, { page: 1, global: true });
  });
}

async function displayEmoji(msg, name, time, emojiCounts, options) {
  let filteredCounts = emojiCounts.slice();
  if(!options) {
    options = {
      page: 1,
      global: false,
    };
  }
  filteredCounts = helpers.sortCountsDesc(filteredCounts);

  if(!options.global) {
    filteredCounts = filteredCounts.filter((count) => msg.guild.emojis.has(count.emojiId));
  } else {
    filteredCounts = filteredCounts.filter((count) => msg.client.emojis.has(count.emojiId));
  }

  const maxPages = Math.ceil(filteredCounts.length / configs.resultsPerPage);
  const start = (options.page - 1) * configs.resultsPerPage;
  const end = start + configs.resultsPerPage;
  const pageCounts = filteredCounts.slice(start, end);

  let response = `**${name}** ${time ? 'Past ' + helpers.timeToString(time) : 'All time'} ${options.global ? '(All Emojis)' : '(Server Emojis)'}\n`;
  if(filteredCounts.length === 0) {
    response += '\nNothing to display.';
  }
  for(let i = 0; i < pageCounts.length; i++) {
    const count = pageCounts[i];
    const emoji = msg.client.emojis.get(count.emojiId);
    response += `${print.bar(count.count, filteredCounts[0].count, configs.displayWidth)} `;
    response += `${emoji.toString()} `;
    response += `${print.rank(options.page, i)} `;
    response += '\n';
  }
  response += `\n Page ${options.page} of ${maxPages}.`;

  let responseMsg;
  if(options.msg) {
    responseMsg = await options.msg.edit(response);
  } else {
    responseMsg = await msg.channel.send(response);
  }
  if(!options.msg) {
    await helpers.addPageControls(responseMsg);
    await helpers.addGlobalToggle(responseMsg);
  }
  const newOptions = await helpers.awaitMenuActionWithGlobal(msg, responseMsg, options, maxPages);
  if(!newOptions) {
    return;
  }
  return displayEmoji(msg, name, time, emojiCounts, newOptions);
}

module.exports = emoji;
