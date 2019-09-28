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

const Users = new UsersRepository();

const commands = {
  display,
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

  const fArgs = args.slice(1);
  fArgs.unshift(msg);
  commands[args[0]].apply(null, fArgs); //executes command
}

function combineEmoji(emojiLists) {
  masterList = [];
  emojiLists.forEach((emojiList) => {
    emojiList.forEach((emoji) => {
      const idx = masterList.indexOf((x) => x.emojiId === emoji);
      if(idx === -1) {
        masterList.push(emoji);
      } else {
        masterList[idx].count += emoji.count;
      }
    });
  });
  return masterList;
}

function displayHelp(msg, emoji) {
  emoji.sort((a, b) => b.count - a.count);

  let guildEmojis = [];
  msg.guild.emojis.forEach((emoji) => {
    guildEmojis.push(`:${emoji.identifier}`);
  });

  let max = 1;
  emoji.forEach((item) => {
    if(guildEmojis.some((x) => x === item.emojiId)) {
      if(item.count > max) {
        max = item.count;
      }
    }
  });

  let response = "";
  emoji.forEach((item) => {
    if(guildEmojis.some((x) => x === item.emojiId)) {
      if(response.length >= 1800) {
        msg.channel.send(response);
        response = "";
      }
      response += "`";
      for(let i = 0; i < item.count * ROW_COUNT / max - 3; i++) {
        response += " ";
      }
      response += "" + item.count + " ` <" + item.emojiId + ">\n";
    }
  });
  msg.channel.send(response);
}

function display(msg, ...userRefs) {
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
      displayHelp(msg, user.emoji);
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
      displayHelp(msg, combinedEmoji);
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
