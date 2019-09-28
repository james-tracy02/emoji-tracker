const Discord = require("discord.js");
const dotenv = require("dotenv"); dotenv.config();

const client = new Discord.Client();
const token = process.env.TOKEN;
const EMOJI_REGEXP = /<:[\w|\d]*:\d*>/g;
const ID_REGEXP = /<(:[\w|\d]*:\d*)>/;
const USERID_REGEXP = /<@!?(\d*)>/;
const COMMAND_PREFIX = ".nanami";

const Mongo = require('mongodb').MongoClient;
const url = process.env.MONGODB_URI;
const mongoClient = new Mongo(url);

// Login
client.login(token);
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  mongoClient.connect((err) => {
    if(!err) {
      console.log('connected to mongo');
    }
  });
});


// Message event listener
client.on('message', msg => {
  if(msg.author.bot) {
    return
  }

  const ids = getEmojiIds(msg.content);
  const author = msg.author;

  const summary = summarize(ids);
  update(author.id, summary);

  if(isCommand(msg)) {
    handleCommand(msg);
  }
  return;
});


// Message event handling
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
      retrieve(userId, (stats) => {
        if(!stats) {
          msg.channel.send("No stats for that user!");
          return;
        }
        console.log(stats);
        stats.sort((a, b) => b.count - a.count);
        let response = `Emoji stats for <@${userId}>:\n\n\n`;
        let emojis = [];
        msg.guild.emojis.forEach((emoji) => {
          emojis.push(`:${emoji.identifier}`);
        });
        let n = 0;
        stats.forEach((item) => {
          if(emojis.some((x) => x === item.emojiId)) {
            n += 1;
            response += "<" + item.emojiId + "> ` " + item.count + " `";
            response += '          ';
          }
        });
        msg.channel.send(response);
      });
    } else {
      msg.channel.send("That user doesn't exist.");
    }
  } else {
    msg.channel.send("I don't know how to do that.");
  }
}

// Message interpretting
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


// DB operations
function update(author, summary) {
  const db = mongoClient.db();
  const users = db.collection('users');

  users.findOne({userId: author}, (err, user) => {
    if(!user) {
      const newUser = {userId: author, emoji: []};
      Object.keys(summary).forEach((emojiId) => {
        newUser.emoji.push({emojiId: emojiId, count: summary[emojiId]});
      });
      users.insertOne(newUser);
    } else {
      const updatedUser = {userId: author, emoji: user.emoji};
      Object.keys(summary).forEach((emojiId) => {
        const idx = user.emoji.findIndex((item) => item.emojiId === emojiId);
        if(idx === -1) {
          updatedUser.emoji.push({emojiId: emojiId, count: summary[emojiId]});
        } else {
          updatedUser.emoji[idx] = {emojiId: emojiId, count: user.emoji[idx].count + summary[emojiId]};
        }
      });
      users.replaceOne({userId: author}, updatedUser);
    }
  });
}

function retrieve(author, callback) {
  const db = mongoClient.db();
  const users = db.collection('users');

  users.findOne({userId: author}, (err, user) => {
    if(!user) {
      callback(null);
    }
    callback(user.emoji);
  });
}

/*
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
*/
