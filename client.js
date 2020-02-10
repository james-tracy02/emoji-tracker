
const Discord = require('discord.js');

const client = new Discord.Client();
const dotenv = require('dotenv');

dotenv.config();

const Nanami = require('./src/nanami.js');

const nanami = new Nanami(client);

client.login(process.env.TOKEN);

client.on('ready', () => {
  nanami.ready();
});

client.on('guildCreate', () => {
  nanami.setStatus();
});

client.on('messageReactionAdd', (reaction, user) => {
  nanami.recordReaction(reaction, user);
});

client.on('message', (message) => {
  if (message.author.bot) return;
  nanami.read(message);
});
