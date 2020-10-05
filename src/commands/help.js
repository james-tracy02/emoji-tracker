const { RichEmbed } = require('discord.js');
const print = require('../print.js');
const configs = require('../configs');

function help(msg) {
  msg.channel.send(new RichEmbed()
  .setColor(configs.color)
  .setTitle(`Emoji Tracker | Prefix 'n.'`)
  .setAuthor("Emoji Tracking Bot", msg.client.user.avatarURL)
  .setDescription(
    'Keep track of your emoji usage!' + '\n\n' +
    '**Commands**\n' +
    print.commands()));
}

module.exports = help;
