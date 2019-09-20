const Discord = require("discord.js");
const dotenv = require("dotenv"); dotenv.config();

const client = new Discord.Client();
const token = process.env.TOKEN;
const EMOJI_REGEXP = /<:[\w|\d]*:\d*>/g;
const ID_REGEXP = /<(:[\w|\d]*:\d*)>/;
const USERID_REGEXP = /<@!?(\d*)>/;
const COMMAND_PREFIX = ".nanami";

// TEMP "DATABASE"
const DB = {}

client.login(token);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  console.log(msg.content);
  const ids = getEmojiIds(msg.content);
  const author = msg.author;

  const summary = summarize(ids);
  update(author.id, summary); // will have to change update method for use with real db

  if(isCommand(msg)) {
    handleCommand(msg);
  }
  return;
});

function isCommand(msg) {
  return msg.content.startsWith(COMMAND_PREFIX);
}

function handleCommand(msg) {
  const raw = msg.content.substring(COMMAND_PREFIX.length + 1);
  const cmd = raw.substring(0, raw.indexOf(" "));
  const user = raw.substring(raw.indexOf(" "));
  const match = user.match(USERID_REGEXP);
  let userId;
  if(match) {
    userId = match[1];
  }
  if(cmd == "display") {
    if(userId) {
      const stats = DB[userId];
      if(!stats) {
        msg.channel.send("No stats for that user!");
        return;
      }
      let response = `Emoji stats for <@${userId}>:\n`;
      Object.keys(stats).forEach((emojiId) => {
        response += `\n<${emojiId}>: ${DB[userId][emojiId]}`;
      });
      msg.channel.send(response);
    } else {
      msg.channel.send("That user doesn't exist.");
    }
  } else {
    msg.channel.send("I don't know how to do that.");
  }
}

function getEmojiIds(content) {
  const emoji = content.match(EMOJI_REGEXP);
  let ids = [];
  if(emoji) {
    emoji.forEach((item, idx) => {
      const id = item.match(ID_REGEXP)[1];
      ids.push(id);
    });
  }
  return ids;
}

// flattens into values
function summarize(ids) {
  uniqueIds = {};
  ids.forEach((item) => {
    if(!uniqueIds.hasOwnProperty(item)) {
      uniqueIds[item] = 0;
    }
    uniqueIds[item] += 1;
  });
  return uniqueIds;
}

function update(author, summary) {
  if(!DB.hasOwnProperty(author)) {
    DB[author] = {};
  }

  Object.keys(summary).forEach((emoji) => {
    if(!DB[author].hasOwnProperty(emoji)) {
      DB[author][emoji] = 0;
    }
    DB[author][emoji] += summary[emoji];
  })
}
