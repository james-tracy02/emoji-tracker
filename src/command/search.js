
const { listEmoji } = require('../helpers.js');

module.exports = function (alterEgo) {
  return {
    meta: {
      name: 'search',
      description: 'List all available emojis.',
      aliases: [],
      usage: `${alterEgo.prefix}search`,
      parameters: [
        {
          name: 'keyword',
          type: {
            type: 'String',
          },
          description: 'The keyword to search for.',
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
      const emojis = msg.client.emojis.filter((emoji) => emoji.name.toLowerCase()
        .includes(args.keyword.toLowerCase()));
      msg.channel.send(listEmoji(alterEgo, emojis, `Results for "${args.keyword}":`, args.page));
    },
  };
};
