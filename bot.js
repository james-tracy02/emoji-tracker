const Discord = require("discord.js");
const dotenv = require("dotenv"); dotenv.config();

const UsersRepository = require("./users.js");

const client = new Discord.Client();
const TOKEN = process.env.TOKEN;

const EMOJI_REGEXP = /<:[\w|\d]*:\d*>/g;
const ID_REGEXP = /<(:[\w|\d]*:\d*)>/;
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
};

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

  if(isCommand(msg)) {
    handleCommand(msg);
    return
  }

  const emojiIds = getEmojiIds(msg.content);
  const author = msg.author;
  const summary = summarize(emojiIds);
  Users.updateAsync(author.id, summary);
  return;

});


// Message event handling
function isCommand(msg) {
  return msg.content.startsWith(COMMAND_PREFIX);
}

function handleCommand(msg) {
  let rest = msg.content.substring(COMMAND_PREFIX.length + 1);
  const args = [];
  let n = 0;

  while(rest.indexOf(" ") !== -1) {
    args.push(rest.substring(0, rest.indexOf(" ")));
    rest = rest.substring(rest.indexOf(" ") + 1);
  }
  args.push(rest);

  if(args.length === 0) {
    return;
  }

  if(commands.hasOwnProperty(args[0])) {
    commands[args[0]](msg, args.slice(1));
  } else{
    msg.channel.send("I don't know how to do that.");
  } //executes command
}

function combineEmoji(emojiLists) {
  masterList = [];
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

function displayOneEmojiHelp(msg, emojiId, counts) {
  counts.sort((a, b) => b.count - a.count);

  let max = 1;
  counts.forEach((item) => {
    if(item.count > max) {
      max = item.count;
    }
  });

  const emojiName = `<${emojiId}>`;
  let response = "Usage stats for " + emojiName + ":\n\n";
  counts.forEach((item) => {
    if(response.length >= 1800) {
      msg.channel.send(response);
      response = "";
    }
    response += "`";
    for(let i = 0; i < item.count * ROW_COUNT / max - 2; i++) {
      response += " ";
    }
    response += "" + item.count + " ` <@" + item.userId + ">\n";
  });

  msg.channel.send(response);
}

function displayHelp(msg, userIds, emoji, options) {
  emoji.sort((a, b) => b.count - a.count);

  let guildEmojis = [];
  msg.guild.emojis.forEach((emoji) => {
    guildEmojis.push(`:${emoji.identifier}`);
  });

  let max = 1;
  let total = 0;
  emoji.forEach((item) => {
    if(guildEmojis.some((x) => x === item.emojiId)) {
      total += 1;
      if(item.count > max) {
        max = item.count;
      }
    }
  });
  let listUsers = "";
  userIds.forEach((id) => {
    listUsers = listUsers + "<@!" + id + ">,";
  });
  listUsers = listUsers.substring(0, listUsers.length - 1);
  let count = 0;
  let offset = 0;
  if(options && options.page) {
    offset = (options.page - 1) * DEFAULT_LINES;
  }
  let rank = 0;
  let response = "Emoji stats for " + listUsers + ":\n\n";
  emoji.forEach((item) => {
    if(guildEmojis.some((x) => x === item.emojiId)) {
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

function getServerMembersAsRefs(guild) {
  userRefs = [];
  guild.members.forEach((member) => {
    if(!member.user.bot) {
      userRefs.push(`<@${member.id}>`);
    }
  });
  return userRefs;
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
  displayOneEmoji(msg, args[0]);
}

function displayOneEmoji(msg, emojiRef) {
  const userRefs = getServerMembersAsRefs(msg.guild);

  if(userRefs.length === 0) {
    msg.channel.send("No valid users.");
    return;
  }

  let emojiId;
  if(!emojiRef) {
    msg.channel.send("No emoji provided!");
  }
  
  const emojiMatch = emojiRef.match(ID_REGEXP);
  if(emojiMatch) {
    emojiId = emojiMatch[1];
  } else {
    msg.channel.send("Invalid emoji!");
    return;
  }

  userIds = [];
  userRefs.forEach((x) => {
    const match = x.match(USERID_REGEXP);
    if(match) {
      userIds.push(match[1]);
    }
  });

  if(userIds.length === 0) {
    msg.channel.send("Invalid users.")
    return;
  }

  Users.retrieveManyAsync(userIds, (err, users) => {
    const counts = [];
    users.forEach((user) => {
      let idx = user.emoji.findIndex((x) => x.emojiId === emojiId);
      if(idx !== -1) {
        counts.push({"userId": user.userId, "count": user.emoji[idx].count});
      }
    });
    displayOneEmojiHelp(msg, emojiId, counts);
  });
}

function say(msg, args) {
  msg.delete();
  let response = "";
  args.forEach((word) => {
    response = response + word + " ";
  })
  msg.channel.send(response.substring(0, response.length - 1));
}

function display(msg, userRefs, options) {
  if(userRefs[0] === "server") {
    userRefs = getServerMembersAsRefs(msg.guild);
  }

  if(userRefs.length === 0) {
    msg.channel.send("No users given.");
    return;
  }

  userIds = [];
  userRefs.forEach((x) => {
    const match = x.match(USERID_REGEXP);
    if(match) {
      userIds.push(match[1]);
    }
  });

  if(userIds.length === 0) {
    msg.channel.send("Invalid users.")
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
  const uniqueIds = {};
  ids.forEach((item) => {
    if(!uniqueIds.hasOwnProperty(item)) {
      uniqueIds[item] = 0;
    }
    uniqueIds[item] += 1;
  });
  return uniqueIds;
}
