const Discord = require("discord.js");
const dotenv = require("dotenv"); dotenv.config();

const client = new Discord.Client();
const token = process.env.TOKEN;

client.login(token);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  console.log(msg.content);
});
