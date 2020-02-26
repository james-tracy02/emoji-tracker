
require('dotenv').config();
const Discord = require('discord.js');
const events = require('./src/event');
const client = new Discord.Client();

Object.keys(events).forEach((eventName) => {
  client.on(eventName, events[eventName](client));
});
client.login(process.env.TOKEN);
