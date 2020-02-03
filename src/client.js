'use strict';

const Discord = require("discord.js");
const client = new Discord.Client();
const dotenv = require("dotenv"); dotenv.config();
const token = process.env.TOKEN;
const Nanami = require('./nanami.js');
const nanami = new Nanami(client);
const Parser = require('./parse.js');

client.login(token);
client.on('ready', () => {
  nanami.ready();
});

client.on('message', message => {
  if(message.author.bot) {
    return;
  }

  const command = Parser.parseCommand(message);
  if(command) {
    nanami.execute(command);
    return;
  }

  const emoji = Parser.parseEmoji(message);
  nanami.recordEmoji(message.author.id, emoji);
});
