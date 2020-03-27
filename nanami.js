
require('dotenv').config();
const Discord = require('discord.js');
const AlterEgo = require('alter-ego.js');
const events = require('./src/event');
const commands = require ('./src/command');
const client = new Discord.Client();

new AlterEgo(client)
  .setPrefix('n.')
  .setName('Nanami Bot')
  .setDescription('I keep track of your emojis!')
  .setColor('#EBC8CB')
  .setOwnerId('265902301443653644')
  .setInvite('https://discordapp.com/oauth2/authorize?client_id=624386401735147531&permissions=1074129984&scope=bot')
  .setEvents(events)
  .setCommands(commands)
  .execute();
