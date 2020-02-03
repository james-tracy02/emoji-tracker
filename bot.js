/*
const Discord = require("discord.js");
const dotenv = require("dotenv"); dotenv.config();
const fs = require("fs");

const UsersRepository = require("./users.js");

const client = new Discord.Client();
const TOKEN = process.env.TOKEN;

const EMOJI_REGEXP = /<a?:[\w|\d]*:\d*>/g;
const ID_REGEXP = /<(a?:[\w|\d]*:\d*)>/;
const USERID_REGEXP = /<@!?(\d*)>/;

const COMMAND_PREFIX = ".nanami";
const ROW_COUNT = "80";
const DEFAULT_LINES = 20;

const Users = new UsersRepository();

const commands = {
  "display": displayDefault,
  "display-page": displayPage,
  "display-emoji": displayEmoji,
  "say": say,
  "use": use,
  "help": help,
};

const helpMsg = fs.readFileSync("./help.txt").toString();

// Login
client.login(TOKEN);
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Message event listener
client.on('message', msg => {
  if(msg.author.bot) {
    return;
  }

  if(msg.content.startsWith(COMMAND_PREFIX)) {
    handleCommand(msg);
    return;
  }

  const emojiIds = getEmojiIds(msg.content);
  const author = msg.author;
  const summary = summarize(emojiIds);
  Users.updateAsync(author.id, summary);
  return;
});

function handleCommand(msg) {
  let rest = msg.content.substring(COMMAND_PREFIX.length + 1);
  const tokens = rest.split(/(\s+)/);
  const args = rest.split(/[\s+]/);
  if(args.length === 0) {
    return;
  }
  if(commands.hasOwnProperty(args[0])) {
    commands[args[0]](msg, args.slice(1), tokens.slice(1));
  } else{
    msg.channel.send("I don't know how to do that.");
  }
}

function combineEmoji(emojiLists) {
  const masterList = [];
  emojiLists.forEach((emojiList) => {
    emojiList.forEach((emoji) => {
      const idx = masterList.findIndex((x) => x.emojiId === emoji.emojiId);
      if(idx === -1) {
        masterList.push(emoji);
      } else {
        masterList[idx].count += emoji.count;
      }
    });
  });
  return masterList;
}

function help(msg) {
  msg.channel.send(helpMsg);
}

function displayOneEmojiHelp(msg, emoji, counts) {
  counts.sort((a, b) => b.count - a.count);

  let max = 1;
  counts.forEach((item) => {
    if(item.count > max) {
      max = item.count;
    }
  });

  let response = `Usage stats for ${emoji.toString()}:\n\n`;
  counts.forEach((item) => {
    if(response.length >= 1800) {
      msg.channel.send(response);
      response = "";
    }
    response += "`";
    for(let i = 0; i < item.count * ROW_COUNT / max - 2; i++) {
      response += " ";
    }
    response += "" + item.count + " ` " + userIdToNickname(msg.guild, item.userId) + "\n";
  });

  msg.channel.send(response);
}

function displayHelp(msg, userIds, emoji, options) {
  emoji.sort((a, b) => b.count - a.count);
  let guildEmojis = [];
  msg.guild.emojis.forEach((emoji) => {
    if(emoji.animated) {
      guildEmojis.push(`a:${emoji.identifier}`)
    } else {
      guildEmojis.push(`:${emoji.identifier}`);
    }
  });
  let max = 1;
  let total = 0;
  emoji.forEach((item) => {
    if(guildEmojis.some((guildEmoji) => item.emojiId === guildEmoji)) {
      total += 1;
      if(item.count > max) {
        max = item.count;
      }
    }
  });
  let listUsers = "";
  userIds.forEach((id) => {
    listUsers = listUsers + userIdToNickname(msg.guild, id) + ", ";
  });
  listUsers = listUsers.substring(0, listUsers.length - 2);
  let count = 0;
  let offset = 0;
  if(options && options.page) {
    offset = (options.page - 1) * DEFAULT_LINES;
  }
  let rank = 0;
  let response = "Emoji stats for " + listUsers + ":\n\n";
  emoji.forEach((item) => {
    if(guildEmojis.some((guildEmoji) => item.emojiId === guildEmoji)) {
      if(offset > 0) {
        offset -= 1;
        return;
      }
      if(count >= DEFAULT_LINES) {
        return;
      }
      count += 1;
      if(response.length >= 1800) {
        msg.channel.send(response);
        response = "";
      }
      response += "`";
      for(let i = 0; i < item.count * ROW_COUNT / max - 2; i++) {
        response += " ";
      }
      rank += 1;
      response += "" + item.count + " ` <" + item.emojiId + ">\n";
    }
  });

  if(options && options.page) {
    response += `\n(Displaying page ${options.page} of ${Math.ceil(total/DEFAULT_LINES)})`;
  } else {
    response += `\n(Displaying page 1 of ${Math.ceil(total/DEFAULT_LINES)})`;
  }

  msg.channel.send(response);
}

function getUserIds(guild) {
  const userIds = [];
  guild.members.forEach((member) => {
    if(!member.user.bot) {
      userIds.push(member.user.id);
    }
  });
  return userIds;
}

function calcOffsetFromPage(page) {
  return (page - 1) * DEFAULT_LINES;
}

function displayDefault(msg, args) {
  display(msg, args);
}

function displayPage(msg, args) {
  display(msg, args.slice(1), {page: args[0]});
}

function displayEmoji(msg, args) {
  const emoji = msg.guild.emojis.find((emoji) => emoji.name === args[0] || emoji.toString() === args[0]);
  if(emoji) {
    displayOneEmoji(msg, emoji);
  } else {
    msg.channel.send("Invalid emoji.");
  }
}

function displayOneEmoji(msg, emoji) {
  const userIds = getUserIds(msg.guild);

  Users.retrieveManyAsync(userIds, (err, users) => {
    const counts = [];
    users.forEach((user) => {
      let idx = user.emoji.findIndex((x) => identifiesEmoji(x.emojiId, emoji));
      if(idx !== -1) {
        counts.push({"userId": user.userId, "count": user.emoji[idx].count});
      }
    });
    displayOneEmojiHelp(msg, emoji, counts);
  });
}

function say(msg, args, tokens) {
  msg.delete();
  let response = "";
  tokens.forEach((token) => {
    response = response + token;
  })
  msg.channel.send(response);
}

function use(msg, args, tokens) {
  msg.delete();
  const emojis = [];
  if(tokens && tokens.length > 0) {
    tokens.forEach((argEmoji) => {
      let newEmoji = client.emojis.find(emoji => emoji.name === argEmoji);
      if(newEmoji) {
        emojis.push(newEmoji);
      } else {
        emojis.push(argEmoji);
      }
    });
  } else {
    return;
  }
  let content = "";
  emojis.forEach((emoji) => content = content + emoji);
  msg.channel.send(msg.member.displayName + ":");
  msg.channel.send(content)
  .then((nmsg) => {
    const emojiIds = getEmojiIds(nmsg.content);
    const author = msg.author;
    const summary = summarize(emojiIds);
    Users.updateAsync(author.id, summary);
  });
  return;
}

function display(msg, userRefs, options) {
  let userIds = [];
  if(userRefs[0] === "server") {
    userIds = getUserIds(msg.guild);
  } else {
    userRefs.forEach((userRef) => {
      const match = userRef.match(USERID_REGEXP);
      if(match) {
        userIds.push(match[1]);
      }
      if(userRef === "me") {
        userIds.push(msg.author.id);
      }
    });
  }

  if(userIds.length === 0) {
    msg.channel.send("No valid users!")
    return;
  }

  if(userIds.length === 1) {
    Users.retrieveOneAsync(userIds[0], (err, user) => {
      if(!user.emoji || user.emoji.length === 0) {
        msg.channel.send("Nothing to display.");
        return;
      }
      displayHelp(msg, userIds, user.emoji, options);
      return;
    });
  } else {
    Users.retrieveManyAsync(userIds, (err, users) => {
      const emojiList = [];
      users.forEach((user) => {
        emojiList.push(user.emoji);
      });
      combinedEmoji = combineEmoji(emojiList);
      if(!combinedEmoji || combinedEmoji.length === 0) {
        msg.channel.send("Nothing to display.");
        return;
      }
      displayHelp(msg, userIds, combinedEmoji, options);
      return;
    });
  }
}

function identifiesEmoji(id, emoji) {
  return `<${id}>` === emoji.toString();
}

// Message interpretting
function getEmojiIds(content) {
  const emoji = content.match(EMOJI_REGEXP);
  let ids = [];
  if(emoji) {
    emoji.forEach((item) => {
      const id = item.match(ID_REGEXP)[1];
      ids.push(id);
    });
  }
  return ids;
}

function summarize(ids) {
  const uniqueIds = {};
  ids.forEach((item) => {
    if(!uniqueIds.hasOwnProperty(item)) {
      uniqueIds[item] = 0;
    }
    uniqueIds[item] += 1;
  });
  return uniqueIds;
}

function userIdToNickname(guild, userId) {
  const nickname = guild.members.get(userId).displayName;
  return nickname;
}
*/
