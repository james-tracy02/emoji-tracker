
const configs = require('../configs.js');
const { listEmoji } = require('../helpers.js');

module.exports = {
  meta: {
    command: 'search-guild',
    description: 'List all available emojis froma given guild.',
    aliases: ['searchg'],
    usage: `${configs.prefix}search-guild`,
    parameters: {
      keyword: {
        name: 'guild',
        type: {
          type: 'String',
        },
        description: 'The guild to search emojis from.',
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

  execute(msg, args) {
    const emojis = msg.client.emojis.filter((emoji) => emoji.guild.name.toLowerCase()
      .includes(args.guild.toLowerCase()));
    msg.channel.send(listEmoji(emojis, `Results from guild "${args.guild}":`, args.page));
  },
};
