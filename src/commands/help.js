const { MessageEmbed } = require('discord.js');
const print = require('../print.js');
const configs = require('../configs');

function help(msg) {
  msg.channel.send(new MessageEmbed()
  .setColor(configs.color)
  .setTitle(`Prefix 'n.'`)
  .setAuthor("Emoji Tracker", msg.client.user.avatarURL)
  .setDescription(
    'Keep track of your emoji usage!' + '\n\n' +
    '**Commands**\n' +
    print.commands()));
}

module.exports = help;
