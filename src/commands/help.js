const { MessageEmbed } = require('discord.js');
const configs = require('../configs');

function help(msg) {
  msg.channel.send(new MessageEmbed()
  .setColor(configs.color)
  .setTitle(`Prefix 'n.'`)
  .setAuthor("Emoji Tracker", msg.client.user.avatarURL)
  .setDescription(
    'Keep track of your emoji usage!' + '\n\n' +
    '**Commands**\n' +
    printCommands()));
}

function printCommands() {
  let cmds = '';
  cmds += '`emoji <@mention | server | all>` - display emoji usage data for the given user, guild, or all emoji data, respectively.\n';
  cmds += '`users <emojiName | emoji>` - display usage data for the given emoji.\n';
  cmds += '`big <emojiName | emoji>` - render a large version of the given emoji.\n';
  cmds += '`add <emojiName | emoji>` - add the given emoji to this server\'s emojis.\n';
  cmds += '`sticker` <name> <url> - creates a sticker with the given name and image link.\n';
  cmds += '`use` <name> - uses the sticker.\n';
  cmds += '`remove` <name> - removes the sticker.\n';
  cmds += '`help` - display this help message.\n';
  cmds += '`invite` - generate an invite link.\n';
  return cmds;
}

module.exports = help;
