
const { RichEmbed } = require('discord.js');
const helpers = require('../helpers.js');
const configs = require('../configs.js');
const print = require('../print.js');
const { recordEmoji } = require('../service/record.js');

module.exports = {
  meta: {
    command: 'big',
    description: 'Send a big version of an emoji.',
    aliases: [],
    usage: `${configs.prefix}big <emoji>`,
    parameters: {
      emoji: {
        name: 'emoji',
        type: {
          type: 'String',
        },
        description: 'The emoji to make big.',
        optional: false,
      },
    },
  },

  execute: function (msg, args) {
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
  }
};
