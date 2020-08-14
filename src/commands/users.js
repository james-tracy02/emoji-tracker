const regexp = require('../regexp');
const records = require('../service/records');
const print = require('../print');
const helpers = require('../helpers');
const configs = require('../configs');

function users(msg, args) {
  const emoji = args[0];
  const time = args[1];
  if(emoji) {
    const match = emoji.match(regexp.renderedEmoji);
    if(match) {
      const emojiObj = msg.channel.guild.emojis.get(match[1]);
      if(emojiObj) {
        return displayUsersForEmoji(msg, emojiObj, time)
      }
    }
  }
  msg.channel.send('Invalid emoji.');
}

function displayUsersForEmoji(msg, emoji, time) {
  const userCounts = records.getRecordsForEmoji(emoji.id, helpers.getDate(time), records => {
    const userCounts = helpers.flattenRecordsByUser(records);
    displayUsers(msg, emoji, time, userCounts);
  });
}

async function displayUsers(msg, emoji, time, userCounts, options) {
  let filteredCounts = userCounts.slice();
  if(!options) {
    options = {
      page: 1,
      global: false,
    };
  }
  filteredCounts = helpers.sortCountsDesc(filteredCounts);

  if(!options.global) {
    filteredCounts = filteredCounts.filter((count) => msg.guild.members.has(count.userId));
  } else {
    filteredCounts = filteredCounts.filter((count) => msg.client.users.has(count.userId));
  }

  const maxPages = Math.ceil(filteredCounts.length / configs.resultsPerPage);
  const start = (options.page - 1) * configs.resultsPerPage;
  const end = start + configs.resultsPerPage;
  const pageCounts = filteredCounts.slice(start, end);

  let response = `**${emoji.name}** ${time ? 'Past ' + helpers.timeToString(time) : 'All time'} ${options.global ? '(All Users)' : '(Server Members)'}\n`;
  if(filteredCounts.length === 0) {
    response += '\nNothing to display.';
  }
  for(let i = 0; i < pageCounts.length; i++) {
    const count = pageCounts[i];
    const member = msg.channel.guild.members.get(count.userId);
    const username = member ? member.nickname : msg.client.users.get(count.userId).username;
    response += `${print.bar(count.count, filteredCounts[0].count, configs.displayWidth)} `;
    response += `${emoji.toString()} ${username} `;
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
  return displayUsers(msg, emoji, time, userCounts, options);
}

module.exports = users;
