
const configs = require('../configs.js');
const { listEmoji } = require('../helpers.js');

module.exports = {
  meta: {
    command: 'search',
    description: 'List all available emojis.',
    aliases: [],
    usage: `${configs.prefix}search`,
    parameters: {
      keyword: {
        name: 'keyword',
        type: {
          type: 'String',
        },
        description: 'The keyword to search for.',
        optional: false,
      },
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
    const emojis = msg.client.emojis.filter((emoji) => emoji.name.toLowerCase()
      .includes(args.keyword.toLowerCase()));
    msg.channel.send(listEmoji(emojis, `Results for "${args.keyword}":`, args.page));
  }
};
