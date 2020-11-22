const { MessageEmbed } = require('discord.js');
const configs = require('../configs');

function invite(msg) {
  msg.channel.send(new MessageEmbed()
  .setColor(configs.color)
  .setTitle(`Invite Emoji Tracker to Your Server!`)
  .setAuthor("Emoji Tracker", msg.client.user.avatarURL)
  .setURL(configs.inviteLink));
}

module.exports = invite;
