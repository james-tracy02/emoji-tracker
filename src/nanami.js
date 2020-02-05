'use strict'

const fs = require('fs');

const Parse = require('./parse');
const Types = require('./types');
const recordService = require('./service.js');
const commands = require('./commands.json');

const DEFAULT_LINES = 20;
const DEFAULT_WIDTH = 80;
const RESPONSE_CUTOFF = 1800;
const PREFIX = 'n.';
const USERID_REGEXP = /<@!?(\d*)>/;
const ID_REGEXP = /<a?:[\w|\d]*:(\d*)>/;

class Nanami {
  constructor(client) {
    this.client = client;
  }

  ready() {
    console.log(`Logged in as ${this.client.user.tag}!`);
    this.setStatus();
  }

  setStatus() {
    this.client.user.setActivity(`in ${this.client.guilds.size} servers!`);
  }

  recordReaction(reaction, user) {
    this.recordEmoji(user.id, [reaction.emoji.id]);
  }

  read(message) {
    // If the message is not a command, handle it normally
    if(!message.content.startsWith(PREFIX))
      return this.handleMessage(message.author.id, message);

    // Otherwise parse the command and execute
    this.execute(message, Parse.command(message.content.substring(PREFIX.length)));
  }

  handleMessage(userId, message) {
    // Record emoji usage and attribute to userId
    this.recordEmoji(userId, Parse.emoji(message.content));
  }

  execute(message, command) {
    switch (command.type) {
      case 'none':
        this.none();
        break;
      case 'help':
        this.help(message);
        break;
      case 'view':
        this.view(message, command.target, command.select, command.index, command.scope);
        break;
      case 'say':
        this.say(message, message.content.substring(PREFIX.length + 4));
        break;
      case 'info':
        this.info(message, command.command);
        break;
      case 'invalid':
        this.invalid(message, command.type);
        break;
      default:
        break;;
    }
  }

  recordEmoji(user, emoji) {
    const emojiCounts = [];
    emoji.forEach((emoji) => {
      if(emojiCounts.hasOwnProperty(emoji)) {
        emojiCounts[emoji]++;
      } else {
        emojiCounts[emoji] = 1;
      }
    });
    Object.keys(emojiCounts).forEach((emoji) => {
      recordService.updateRecord(user, emoji, emojiCounts[emoji]);
    });
  }

  // Commands
  none() {
    return;
  }

  help(message) {
    let helpMsg = '**Emoji Tracker** ***Nanami Bot***\n\n'
    + '**Commands:**\n'
    + '*Say* `n.info <command>` *to find out more!*\n\n';


    commands.forEach((command) => {
      helpMsg += '`' + command.command + '` - ' + command.description + '\n';
    });

    message.channel.send(helpMsg);
  }

  view(message, target, select, index, scope) {
    const user = this.matchUser(target);
    if(user)
      return this.viewUser(message, user, select, index, scope);

    const emoji = this.matchEmoji(target);
    if(emoji)
      return this.viewEmoji(message, emoji, select, index, scope);

    return this.invalid(message, 'view');
  }

  say(message, text) {
    message.delete();
    let newText = '**' + this.userToNickname(message.guild, message.author.id) + ':**';
    message.channel.send(newText);
    newText = '';
    const toks = text.split(/(\s+)/);
    const emoji = [];
    toks.forEach((token) => {
      const emojiId = this.getEmojiFromName(token);
      if(emojiId) {
        emoji.push(emojiId);
        newText += this.emojiToString(emojiId);
      } else if (token == '\n'){
        console.log(newText);
        if(newText.length > 0)
          message.channel.send(newText);
        newText = '';
      } else {
        newText += token;
      }
    });
    if(newText.length > 0)
      message.channel.send(newText);

    this.recordEmoji(message.author.id, emoji);
  }

  info(message, name) {
    const command = commands.find((command) => command.command === name || command.aliases.includes(name));
    if(!command)
      return;
    let cmdMsg = '**Command:** ' + command.command + '\n'
    + '\t**Description:** *' + command.description + '*\n'
    + '\t**Aliases:** ';
    command.aliases.forEach((alias) => {
      cmdMsg += '`' + alias + '` ';
    });
    cmdMsg += '\n';
    cmdMsg += '\t**Usage:** `' + command.usage + '`\n';
    if(command.parameters.length != 0) {
      cmdMsg += '\t**Parameters:**\n';
      command.parameters.forEach((parameter) => {
        cmdMsg += '\t\t**' + parameter.name + '** [' + parameter.type.type + ']: ';
        cmdMsg += '*' + parameter.description + '*';
        if(parameter.optional)
          cmdMsg += ' (Optional)';
        cmdMsg += '\n';
      });
    }

    message.channel.send(cmdMsg);
  }

  invalid(message) {
    message.channel.send("I don't know how to do that.");
  }

  matchUser(target) {
    if(['me', 'my', 'server', 'all'].includes(target)) {
      return target;
    }
    const match = target.match(USERID_REGEXP);
    if(match) {
      return match[1];
    }
  }

  matchEmoji(target) {
    const match = target.match(ID_REGEXP);
    if(match) {
      return match[1];
    }

    return this.getEmojiFromName(target);
  }

  async viewUser(message, user, select, index, scope) {
    let validEmoji;
    if(scope === 'global')
      validEmoji = this.getClientEmoji();
    if(scope === 'local')
      validEmoji = this.getGuildEmoji(message.guild);

    // filter by scope
    let records = await this.getRecordsForUsers(message, user);
    records = records.filter((record) => validEmoji.includes(record.emoji));

    // generate response
    let username;
    switch (user) {
      case 'me':
      case 'my':
        username = this.userToNickname(message.guild, message.author.id);
        break;
      case 'server':
        username = 'Server';
        break;
      case 'all':
        username = 'All Users';
        break;
      default:
        username = this.userToNickname(message.guild, user)
        break;
    }

    const page = ((select === 'page') ? index : 1);
    const lines = ((select === 'top') ? index : DEFAULT_LINES);
    const maxVal = records[0].count;
    const displaySet = this.getDisplaySet(records, page, lines);

    let response = '**' + username + (scope === global ? '(Global)' : '') + ':**\n';
    displaySet.forEach((record, i) => {
      response += this.generateBar(record.count, maxVal) + ' ';
      response += this.emojiToString(record.emoji) + ' ';
      response += this.generateRank(page, i) + ' ';
      response += '\n';

      // if response too long
      if(response.length >= RESPONSE_CUTOFF) {
        message.channel.send(response);
        response = '';
      }
    });
    if(select === 'page')
      response += '\n Page ' + page + ' of ' + Math.ceil(records.length/DEFAULT_LINES) + '.';
    message.channel.send(response);
  }

  async viewEmoji(message, emoji, select, index, scope) {
    let records = await this.getRecordsForEmoji(emoji);

    if(scope === 'local') {
      const validUsers = this.getGuildMemberIds(message.guild);
      records = records.filter((record) => validUsers.includes(record.user));
    }
    const page = ((select === 'page') ? index : 1);
    const lines = ((select === 'top') ? index : DEFAULT_LINES);
    const maxVal = records[0].count;
    const displaySet = this.getDisplaySet(records, page, lines);

    const emojiName = this.client.emojis.get(emoji).name;
    let response = '**' + emojiName + (scope === global ? '(Global)' : '') + ':**\n';
    displaySet.forEach((record, i) => {
      response += this.generateBar(record.count, maxVal) + ' ';
      response += this.emojiToString(emoji) + ' ';
      response += this.userToNickname(message.guild, record.user) + ' ';
      response += this.generateRank(page, i) + ' ';
      response += '\n';

      // if response too long
      if(response.length >= RESPONSE_CUTOFF) {
        message.channel.send(response);
        response = '';
      }
    });
    if(select === 'page')
      response += '\n Page ' + page + ' of ' + Math.ceil(records.length/DEFAULT_LINES) + '.';
    message.channel.send(response);
  }

  getDisplaySet(records, page, lines) {
    const offset = (page - 1) * DEFAULT_LINES;

    const displaySet = [];
    for(let i = offset; i < offset + lines && i < records.length; i++) {
      displaySet.push(records[i]);
    }
    if(displaySet.length < 1) {
      this.notFound(message);
      return;
    }
    return displaySet;
  }

  getRecordsForUsers(message, users) {
    switch (users) {
      case 'me':
        return recordService.getRecordsForUser(message.author.id);
      case 'my':
        return recordService.getRecordsForUser(message.author.id);
      case 'server':
        return recordService.getRecordsForUsers(this.getGuildMemberIds(message.guild));
      case 'all':
        return recordService.getRecordsForAllUsers();
      default:
        return recordService.getRecordsForUser(users);
    }
  }

  getRecordsForEmoji(emoji) {
    return recordService.getRecordsForEmoji(emoji);
  }

  getGuildMemberIds(guild) {
    const userIds = [];
    guild.members.forEach((member) => {
      if(!member.user.bot) {
        userIds.push(member.user.id);
      }
    });
    return userIds;
  }

  getClientEmoji() {
    const emojiList = [];
    this.client.emojis.forEach((emoji) => emojiList.push(emoji.id));
    return emojiList;
  }

  getGuildEmoji(guild) {
    const emojiList = [];
    guild.emojis.forEach((emoji) => emojiList.push(emoji.id));
    return emojiList;
  }

  getEmojiFromName(name) {
    const emoji = this.client.emojis.find(emoji => emoji.name === name);
    if(emoji)
      return emoji.id;
  }

  emojiToString(emojiId) {
    const emoji = this.client.emojis.find((emoji) => emoji.id == emojiId);
    return emoji.toString();
  }

  userToNickname(guild, user) {
    if(guild.members.has(user)) {
      return guild.members.get(user).displayName;
    }
    return this.client.users.get(user).username;
  }

  // Visualization
  generateBar(count, maxValue) {
    const inc = DEFAULT_WIDTH / maxValue;
    const pad = count.toString().length;
    let bar = '`';
    for(let i = 0; i < count * DEFAULT_WIDTH / maxValue - pad; i++) {
      bar += ' ';
    }
    bar += count + ' `';
    return bar;
  }

  generateRank(page, index) {
    let rank = '';
    if(page == 1) {
      for(let stars = 3 - index; stars > 0; stars--) {
        rank += '\u2605';
      }
    }
    return rank;
  }

  notFound(message) {
    message.channel.send("Nothing to display.");
  }
}

module.exports = Nanami;
