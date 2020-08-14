const records = require('../service/records');
const print = require('../print');
const regexp = require('../regexp');
const helpers = require ('../helpers');
const configs = require('../configs');

function emoji(msg, args) {
  const user = args[0];
  const time = helpers.parseTime(args[1]);
  if(!user) {
    displayEmojiForUser(msg, msg.author, time);
  } else if(user.toLowerCase() === "server") {
    displayEmojiForUsers(msg, msg.channel.guild.members, time);
  } else if(user.toLowerCase() === "all") {
    displayEmojiForAllUsers(msg, time);
  } else {
    const match = user.match(regexp.userMention);
    if(!match) {
      return msg.channel.send("Invalid user.");
    }
    const userObj = msg.channel.guild.members.get(match[1]);
    if(userObj) {
      displayEmojiForUser(msg, userObj, time);
    } else {
      msg.channel.send("Invalid user.");
    }
  }
}

function displayEmojiForUser(msg, user, time) {
  const emojiCounts = records.getRecordsForUser(user.id, helpers.getDate(time), records => {
    const emojiCounts = helpers.flattenRecordsByEmoji(records);
    const member = msg.guild.member(user);
    displayEmoji(msg, member.nickname, time, emojiCounts);
  });
}

function displayEmojiForUsers(msg, users, time) {
  const userIds = [...users.keys()];
  const emojiCounts = records.getRecordsForUsers(userIds, helpers.getDate(time), records => {
    const emojiCounts = helpers.flattenRecordsByEmoji(records);
    displayEmoji(msg, msg.channel.guild.name, time, emojiCounts);
  });
}

function displayEmojiForAllUsers(msg, time) {
  const emojiCounts = records.getAllRecords(helpers.getDate(time), records => {
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
    response += '\nNothing to display.'
    if(options.msg) {
      return options.msg.edit(response);
    } else {
      return msg.channel.send(response);
    }
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
