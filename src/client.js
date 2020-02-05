'use strict';

const Discord = require("discord.js");
const client = new Discord.Client();
const dotenv = require("dotenv"); dotenv.config();

const Nanami = require('./nanami.js');
const nanami = new Nanami(client);

client.login(process.env.TOKEN);

client.on('ready', () => {
  nanami.ready();
});

client.on('guildCreate', guild => {
  nanami.setStatus();
});

client.on('messageReactionAdd', async)

client.on('message', message => {
  if(message.author.bot)
    return;
  nanami.read(message);
});
