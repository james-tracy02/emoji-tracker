
const helpers = require('../helpers.js');
const { recordEmoji } = require('../service/record.js');

module.exports = function (alterEgo) {
  return {
    meta: {
      name: 'big',
      description: 'Send a big version of an emoji.',
      aliases: [],
      usage: `${alterEgo.prefix}big <emoji>`,
      parameters: [
        {
          name: 'emoji',
          type: {
            type: 'String',
          },
          description: 'The emoji to make big.',
          optional: false,
        },
      ],
    },

    execute(msg, args) {
      msg.delete();
      const emojiObj = helpers.getEmojiObj(msg, args.emoji);
      if (!emojiObj) {
        msg.channel.send('Invalid emoji.');
        return;
      }
      const bigEmbed = helpers.makeUserEmbed(msg.member);
      bigEmbed.setImage(emojiObj.url);
      msg.channel.send(bigEmbed);
      recordEmoji(msg.author.id, [emojiObj.id]);
    },
  };
};
