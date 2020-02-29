
const { listEmoji } = require('../helpers.js');

module.exports = function (alterEgo) {
  return {
    meta: {
      name: 'search-guild',
      description: 'List all available emojis froma given guild.',
      aliases: ['searchg'],
      usage: `${alterEgo.prefix}search-guild`,
      parameters: [
        {
          name: 'guild',
          type: {
            type: 'String',
          },
          description: 'The guild to search emojis from.',
          optional: false,
        },
        {
          name: 'page',
          type: {
            type: 'Number',
          },
          description: 'The page of results.',
          optional: true,
          default: 1,
        },
      ],
    },

    execute(msg, args) {
      const emojis = msg.client.emojis.filter((emoji) => emoji.guild.name.toLowerCase()
        .includes(args.guild.toLowerCase()));
      msg.channel.send(listEmoji(alterEgo, emojis, `Results from guild "${args.guild}":`, args.page));
    },
  };
};
