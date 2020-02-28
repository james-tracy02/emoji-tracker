
const { RichEmbed } = require('discord.js');
const configs = require('../configs.js');
const print = require('../print.js');
const commands = require('./');

module.exports = {
  meta: {
    command: 'info',
    description: 'Look up information on a given command.',
    aliases: [],
    usage: `${configs.prefix}info <command>`,
    parameters: {
      command: {
        name: 'command',
        type: {
          type: 'String',
        },
        description: 'The command to lookup.',
        optional: false,
      },
    },
  },

  execute(msg, args) {
    const desc = print.command(args.command, commands);
    if (desc === '') {
      msg.channel.send('Invalid command name.');
      return;
    }
    msg.channel.send(new RichEmbed()
      .setColor(configs.color)
      .setTitle(args.command)
      .setDescription(desc));
  },
};
