
require('dotenv').config();
const TOKEN = process.env.TOKEN;
const PREFIX = 'n.';
const Discord = require('discord.js');
const commands = require('./src/commands');
const emojiManager = require('./src/emojiManager');
const helpers = require('./src/helpers');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({ game: { name: `emoji in ${client.guilds.size} servers` , type: 'WATCHING' }});
});

client.on('message', msg => {
  if(msg.author.bot) {
    return;
  }

  if(msg.content.startsWith(PREFIX)) {
    const command = msg.content.substring(PREFIX.length);
    const tokens = command.split(" ");
    const cmd = tokens[0];
    const args = tokens.slice(1);
    commands.execute(msg, cmd, args);
  } else {
    const newContent = emojiManager.enrich(msg);
    if(newContent) {
      msg.delete().catch(err => console.error(err));;
      helpers.msgOnBehalf(msg, newContent, msg.author.id);
      emojiManager.count(msg.author.id, msg.guild.id, newContent);
    } else {
      emojiManager.count(msg.author.id, msg.guild.id, msg.content);
    }
  }
});

client.login(TOKEN);
