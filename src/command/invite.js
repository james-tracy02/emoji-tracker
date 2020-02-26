
const { RichEmbed } = require('discord.js');
const configs = require('../configs.js');
const print = require('../print.js');

module.exports = {
  meta: {
    command: 'invite',
    description: 'Generate an invite link!',
    aliases: [],
    usage: `${configs.prefix}invite`,
    parameters: {},
  },

  execute: function (msg, args) {
    msg.channel.send(new RichEmbed()
      .setColor(configs.color)
      .setTitle('Click here to invite me to your server!')
      .setAuthor('Emoji Tracker', msg.client.user.avatarURL)
      .setURL(configs.invite)
      .setFooter(`Made by ${configs.owner}`,
        configs.ownerAvatar));
  }
};
