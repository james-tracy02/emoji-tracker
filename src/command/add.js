
const helpers = require('../helpers');

module.exports = function (alterEgo) {
  return {
    meta: {
      name: 'add',
      description: 'Adds an emoji from another server to this server\'s emoji list.',
      aliases: [],
      usage: `${alterEgo.prefix}add <emoji>`,
      parameters: [
        {
          name: 'emoji',
          type: {
            type: 'String',
          },
          description: 'The emoji to add.',
          optional: false,
        },
        {
          name: 'name',
          type: {
            type: 'String',
          },
          description: 'The new name for the emoji.',
          optional: true,
          default: null,
        },
      ],
    },

    execute(msg, args) {
      const emojiObj = helpers.getEmojiObj(msg, args.emoji);
      if (!emojiObj) return msg.channel.send('Invalid emoji!');
      if (msg.guild.emojis.has(emojiObj.id)) {
        return msg.channel.send(
          `This server already contains **${emojiObj.name}**!`,
        );
      }
      msg.guild.createEmoji(emojiObj.url, args.name || emojiObj.name); // need to error handle here
      const addEmbed = helpers.makeUserEmbed(msg.member);
      addEmbed.setDescription(`Added **${args.name || emojiObj.name}** from **${emojiObj.guild.name}** to **${msg.guild.name}**.`);
      addEmbed.setImage(emojiObj.url);
      return msg.channel.send(addEmbed);
    },
  };
};
