
const { RichEmbed } = require('discord.js');
const configs = require('../configs.js');
const print = require('../print.js');
const commands = require('./');

module.exports = {
  meta: {
    command: 'help',
    description: 'Display this help message.',
    aliases: [],
    usage: `${configs.prefix}help`,
    parameters: {},
  },

  execute(msg) {
    msg.channel.send(new RichEmbed()
      .setColor(configs.color)
      .setTitle(`Nanami Bot | Prefix ${configs.prefix}`)
      .setAuthor('Emoji Tracker', msg.client.user.avatarURL)
      .setDescription(
        `${'I give you new ways to interact with and use emojis.\n\n'
      + '**Commands**\n'
      + '*Say* `n.info <command>` *to find out more!*\n\n'}${
          print.commands(commands)}`,
      )
      .setFooter(`Made by ${configs.owner}`,
        configs.ownerAvatar));
  },
};
