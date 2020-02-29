
const { listEmoji } = require('../helpers.js');

module.exports = function (alterEgo) {
  return {
    meta: {
      name: 'list',
      description: 'List all available emojis.',
      aliases: [],
      usage: `${alterEgo.prefix}list`,
      parameters: [
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
      msg.channel.send(
        listEmoji(msg.client.emojis, 'Emoji Catalog:', args.page),
      );
    },
  };
};
