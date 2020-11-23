const records = require('../service/records');
const print = require('../print');
const regexp = require('../regexp');
const helpers = require ('../helpers');
const configs = require('../configs');

function emoji(msg, user, time) {
  time = helpers.parseTime(time);
  let match;
  if(user) {
    match = user.match(regexp.userMention);
  }
  if(!user) {
    displayEmojiForMember(msg, msg.member, time);
  }
  else if(user.toLowerCase() === "server") {
    displayEmojiForGuild(msg, msg.channel.guild, time);
  }
  else if(user.toLowerCase() === "all") {
    displayEmojiForAll(msg, time);
  }
  else if(match) {
    const memberObj = msg.channel.guild.members.cache.get(match[1]);
    if(memberObj) {
      displayEmojiForMember(msg, memberObj, time);
    } else {
      msg.channel.send("Invalid user.");
    }
  }
  else {
    msg.channel.send("Invalid user.");
  }
}

function displayEmojiForMember(msg, member, time) {
  const emojiCounts = records.getRecordsForUser(member.user.id, helpers.getDate(time))
  .then(records => {
    const emojiCounts = helpers.flattenRecordsByEmoji(records);
    displayEmoji(msg, member.displayName, time, emojiCounts);
  })
  .catch(err => {
    console.error(`Error fetching records for member: ${member.id}`);
    console.error(err);
  });
}

function displayEmojiForGuild(msg, guild, time) {
  const guildId = guild.id;
  const emojiCounts = records.getRecordsForGuild(guildId, helpers.getDate(time))
  .then(records => {
    const emojiCounts = helpers.flattenRecordsByEmoji(records);
    displayEmoji(msg, guild.name, time, emojiCounts);
  })
  .catch(err => {
    console.error(`Error fetching records for guild: ${guild}`);
    console.error(err);
  });
}

function displayEmojiForAll(msg, time) {
  const emojiCounts = records.getAllRecords(helpers.getDate(time))
  .then(records => {
    const emojiCounts = helpers.flattenRecordsByEmoji(records);
    displayEmoji(msg, "All Users", time, emojiCounts, { page: 1, global: true });
  })
  .catch(err => {
    console.error(`Error fetching all records.`);
    console.error(err);
  });
}

async function displayEmoji(msg, name, time, emojiCounts, options) {
  let filteredCounts = emojiCounts.slice();
  if(!options) {
    options = {
      page: 1,
      global: false,
      showUnused: false,
    };
  }
  filteredCounts = helpers.sortCountsDesc(filteredCounts);

  if(options.showUnused) {
    msg.client.emojis.cache.forEach((emoji) => {
      if(!filteredCounts.some((count) => count.emojiId === emoji.id)) {
        filteredCounts.push({ emojiId: emoji.id, count: 0});
      }
    });
  }

  if(!options.global) {
    filteredCounts = filteredCounts.filter((count) => msg.guild.emojis.cache.has(count.emojiId));
  } else {
    filteredCounts = filteredCounts.filter((count) => msg.client.emojis.cache.has(count.emojiId));
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
    const emoji = msg.client.emojis.cache.get(count.emojiId);
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
    await helpers.addViewControls(responseMsg);
  }
  const newOptions = await helpers.awaitMenuActionWithViews(msg, responseMsg, options, maxPages);
  if(!newOptions) {
    return;
  }
  return displayEmoji(msg, name, time, emojiCounts, newOptions);
}

module.exports = emoji;
