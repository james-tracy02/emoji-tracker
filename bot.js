const Discord = require("discord.js");
const dotenv = require("dotenv"); dotenv.config();

const client = new Discord.Client();
const token = process.env.TOKEN;
const EMOJI_REGEXP = /<:[\w|\d]*:\d*>/g;
const ID_REGEXP = /<(:[\w|\d]*:\d*)>/;
const USERID_REGEXP = /<@!?(\d*)>/;
const COMMAND_PREFIX = ".nanami";
const TOTAL = "T";

// TEMP "DATABASE"
const DB = {"T": []}

client.login(token);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  const ids = getEmojiIds(msg.content);
  const author = msg.author;

  const summary = summarize(ids);
  updateDB(author.id, summary); // will have to change update method for use with real db

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
      const stats = retrieveDB(userId);
      if(!stats.author) {
        msg.channel.send("No stats for that user!");
        return;
      }
      let response = `Emoji stats for <@${userId}>:\n   # of times used   % of emojis used   % of total for server\n`;
      stats.author.forEach((item) => {
        const authorTotal = stats.author.find((x) => x.emojiId == TOTAL);
        const authorRatio = item.count / authorTotal.count;
        const serverTotal = stats.total.find((x) => x.emojiId == item.emojiId);
        const serverRatio = item.count / serverTotal.count;
        response += `\n<${item.emojiId}> | ${item.count} | ${authorRatio.toFixed(4) * 100}% | ${serverRatio.toFixed(4) * 100}%`;
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

function updateDB(author, summary) {
  if(!DB.hasOwnProperty(author)) {
    DB[author] = [];
  }

  Object.keys(summary).forEach((emojiId) => {
    let idx = DB[author].findIndex((item) => item.emojiId == emojiId);
    if(idx == -1) {
      DB[author].push({emojiId: emojiId, count: 0});
      idx = DB[author].length - 1;
    }
    let idxT = DB[author].findIndex((item) => item.emojiId == TOTAL);
    if(idxT == -1) {
      DB[author].push({emojiId: TOTAL, count: 0});
      idxT = DB[author].length - 1;
    }
    let idxTT = DB[TOTAL].findIndex((item) => item.emojiId == emojiId);
    if(idxTT == -1) {
      DB[TOTAL].push({emojiId: emojiId, count: 0});
      idxTT = DB[TOTAL].length - 1;
    }
    let idxTTT = DB[TOTAL].findIndex((item) => item.emojiId == TOTAL);
    if(idxTTT == -1) {
      DB[TOTAL].push({emojiId: TOTAL, count: 0});
      idxTTT = DB[TOTAL].length - 1;
    }
    DB[author][idx].count += summary[emojiId];
    DB[author][idxT].count += summary[emojiId];
    DB[TOTAL][idxTT].count += summary[emojiId];
    DB[TOTAL][idxTTT].count += summary[emojiId];
  });
}

function retrieveDB(author) {
  DB[author].sort((a, b) => b.count - a.count);
  DB[TOTAL].sort((a, b) => b.count - a.count);
  return {author: DB[author], total: DB[TOTAL]};
}
