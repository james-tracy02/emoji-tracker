
const recordService = require('../service/record.js');
const configs = require('../configs.js');
const helpers = require('../helpers.js');
const print = require('../print.js');

function total(records) {
  let total = 0;
  records.forEach((record) => {
    total += record.count;
  });
  return total;
}

function getDisplaySet(msg, records, page, lines) {
  const offset = (page - 1) * configs.resultsPerPage;
  const displaySet = [];
  for (let i = offset; i < offset + lines && i < records.length; i += 1) {
    displaySet.push(records[i]);
  }
  return displaySet;
}

async function viewUser(msg, userIds, select, index, scope) {
  let username;
  let records;
  switch (userIds.length) {
    case 0:
      username = 'All Users';
      records = await recordService.getRecordsForAllUsers();
      break;
    case 1:
      username = msg.guild.members.get(userIds[0]).displayName;
      records = await recordService.getRecordsForUser(userIds[0]);
      break;
    default:
      username = 'Server';
      records = await recordService.getRecordsForUsers(userIds);
      break;
  }

  records = records.filter((record) => (scope === 'global'
    ? msg.client.emojis.has(record.emoji)
    : msg.guild.emojis.has(record.emoji)));

  const page = (select === 'page' ? index : 1);
  const lines = (select === 'top' ? index : configs.resultsPerPage);

  const displaySet = getDisplaySet(msg, records, page, lines);
  if (displaySet.length < 1) {
    msg.channel.send('Nothing to display.');
    return;
  }
  const maxVal = records[0].count;
  let response = `**${username}${scope === global ? '(Global)' : ''}:**\n`;
  response += `*Total: ${total(records)}*\n`;
  displaySet.forEach((record, i) => {
    const emoji = msg.client.emojis.get(record.emoji);
    response += `${print.bar(record.count, maxVal, configs.displayWidth)} `;
    response += `${emoji.toString()} `;
    response += `${print.rank(page, i)} `;
    response += '\n';
    if (response.length >= configs.responseCutoff) {
      msg.channel.send(response);
      response = '';
    }
  });
  if (select === 'page') response += `\n Page ${page} of ${Math.ceil(records.length / configs.resultsPerPage)}.`;
  msg.channel.send(response);
}

async function viewEmoji(msg, emojiObj, select, index, scope) {
  let records = await recordService.getRecordsForEmoji(emojiObj.id);

  if (scope === 'local') records = records.filter((record) => msg.guild.members.has(record.user));
  const page = (select === 'page' ? index : 1);
  const lines = (select === 'top' ? index : configs.resultsPerPage);

  const displaySet = getDisplaySet(msg, records, page, lines);
  if (displaySet.length < 1) {
    msg.channel.send('Nothing to display.');
    return;
  }
  const maxVal = records[0].count;
  const emojiName = emojiObj.name;
  let response = `**${emojiName}${scope === global ? '(Global)' : ''}:**\n`;
  response += `*Total: ${total(records)}*\n`;
  displaySet.forEach((record, i) => {
    const member = msg.guild.members.get(record.user);
    response += `${print.bar(record.count, maxVal, configs.displayWidth)} `;
    response += `${emojiObj.toString()} `;
    response += `${member ? member.displayName : msg.client.users.get(record.user).username} `;
    response += `${print.rank(page, i)} `;
    response += '\n';

    // if response too long
    if (response.length >= configs.responseCutoff) {
      msg.channel.send(response);
      response = '';
    }
  });
  if (select === 'page') response += `\n Page ${page} of ${Math.ceil(records.length / configs.resultsPerPage)}.`;
  msg.channel.send(response);
}

module.exports = function (alterEgo) {
  return {
    meta: {
      name: 'view',
      description: 'Look up emoji stats on a given target.',
      aliases: ['display'],
      usage: `${alterEgo.prefix}view <target> <select> <index> <scope>`,
      parameters: [
        {
          name: 'target',
          type: {
            type: 'String',
          },
          description: 'The target to query. Can be a user or an emoji.',
          optional: true,
          default: 'me',
        },
        {
          name: 'select',
          type: {
            type: 'Enum',
            values: ['top', 'page'],
          },
          description: 'The selection type of the query. `top` indicates the results with the highest count. `page` indicates an offset.',
          optional: true,
          default: 'page',
        },
        {
          name: 'index',
          type: {
            type: 'Number',
          },
          description: 'The page number or number of items to be displayed.',
          optional: true,
          default: 1,
        },
        {
          name: 'scope',
          type: {
            type: 'Enum',
            values: ['local', 'global'],
          },
          description: 'The scope of the query. `local` indicates results related to this guild only. `global` indicates all results.',
          optional: true,
          default: 'local',
        },
      ],
    },

    execute(msg, args) {
      const userIds = helpers.getUserIds(msg, args.target);
      if (userIds) return viewUser(msg, userIds, args.select, args.index, args.scope);
      const emojiObj = helpers.getEmojiObj(msg, args.target);
      if (emojiObj) return viewEmoji(msg, emojiObj, args.select, args.index, args.scope);
      return msg.channel.send('Invalid query.');
    },
  };
};
