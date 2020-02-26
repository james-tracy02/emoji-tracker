
const configs = require('../configs.js');
const { listEmoji } = require('../helpers.js');

module.exports = {
  meta: {
    command: 'list',
    description: 'List all available emojis.',
    aliases: [],
    usage: `${configs.prefix}list`,
    parameters: {
      page: {
        name: 'page',
        type: {
          type: 'Number',
        },
        description: 'The page of results.',
        optional: true,
        default: 1,
      },
    },
  },

  execute: function (msg, args) {
    msg.channel.send(
      listEmoji(msg.client.emojis, 'Emoji Catalog:', args.page));
  }
};
