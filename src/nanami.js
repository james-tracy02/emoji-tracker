'use strict'

const fs = require('fs');

const Parser = require('./parse');
const recordService = require('./service.js');

const DEFAULT_LINES = 20;
const DEFAULT_WIDTH = 80;
const RESPONSE_CUTOFF = 1800;

const helpMessage = fs.readFileSync('./src/help.txt').toString();

class Nanami {
  constructor(client) {
    this.client = client;
  }

  ready() {
    console.log(`Logged in as ${this.client.user.tag}!`);
  }

  execute(command) {
    switch (command.type) {
      case 'HELP':
        this.help(command.message);
        return;
      case 'VIEW_USER':
        this.viewUser(command.message, command.user, command.display, command.count, command.scope);
        return;
      case 'VIEW_EMOJI':
        this.viewEmoji(command.message, command.emoji, command.emojiName, command.display, command.count, command.scope);
        return;
      case 'SAY':
        this.say(command.message, command.text);
      default:
        this.invalid(command.message);
        return;
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

  getRecordsForUsers(message, users) {
    let records;
    switch (users) {
      case 'me':
        records = recordService.getRecordsForUser(message.author.id);
        break;
      case 'my':
        records = recordService.getRecordsForUser(message.author.id);
        break;
      case 'server':
        records = recordService.getRecordsForUsers(this.getUsers(message.guild));
        break;
      case 'all':
        records = recordService.getRecordsForAllUsers();
        break;
      default:
        records = recordService.getRecordsForUser(users);
        break;
    }
    return records;
  }

  getRecordsForEmoji(emoji) {
    return recordService.getRecordsForEmoji(emoji);
  }

  getUsers(guild) {
    const users = [];
    guild.members.forEach((member) => {
      if(!member.user.bot) {
        users.push(member.user.id);
      }
    });
    return users;
  }

  getEmoji() {
    const emojiList = [];
    client.emojis.forEach((emoji) => emojiList.push(emoji.id));
    return emojiList;
  }

  getEmojiForGuild(guild) {
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
    return guild.members.get(user).displayName;
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

  // COMMANDS
  help(message) {
    message.channel.send(helpMessage);
  }

  say(message, text) {
    message.channel.send(text);
  }

  async viewEmoji(message, emoji, emojiName, display = 'page', count = 1, scope = 'local') {
    if(!emoji) {
      emoji = this.getEmojiFromName(emojiName);
    }

    if(!emoji) {
      this.notFound();
    }

    let records = await this.getRecordsForEmoji(emoji);

    if(scope === 'local') {
      const validUsers = this.getUsers(message.guild);
      records = records.filter((record) => validUsers.includes(record.user));
    }

    let page = 1;
    let lines = DEFAULT_LINES;

    if(display === 'top') {
      lines = count;
    }

    if(display === 'page') {
      page = count;
    }

    // generate set to display
    const offset = (page - 1) * DEFAULT_LINES;
    const displaySet = [];

    for(let i = offset; i < offset + lines && i < records.length; i++) {
      displaySet.push(records[i]);
    }

    // check for results that meet the criteria
    if(displaySet.length < 1) {
      this.notFound(message);
      return;
    }

    // get Max Value
    const maxVal = records[0].count;

    // generate response
    let response = '';
    displaySet.forEach((record, i) => {
      response += this.generateBar(record.count, maxVal) + ' ';
      response += this.userToNickname(message.guild, record.user) + ' ';
      response += this.generateRank(page, i) + ' ';
      response += '\n';

      // if response too long
      if(response.length >= RESPONSE_CUTOFF) {
        message.channel.send(response);
        response = '';
      }
    });

    if(display === 'page') {
      response += '\n Page ' + page + ' of ' + Math.ceil(records.length/DEFAULT_LINES) + '.';
    }

    message.channel.send(response);
  }

  async viewUser(message, users, display = 'page', count = 1, scope = 'local') {
    let records = await this.getRecordsForUsers(message, users);

    let validEmoji;
    if(scope === 'global')
      validEmoji = this.getEmoji();
    if(scope === 'local')
      validEmoji = this.getEmojiForGuild(message.guild);

    // filter by scope
    records = records.filter((record) => validEmoji.includes(record.emoji));

    let page = 1;
    let lines = DEFAULT_LINES;

    if(display === 'top') {
      lines = count;
    }

    if(display === 'page') {
      page = count;
    }

    // generate set to display
    const offset = (page - 1) * DEFAULT_LINES;
    const displaySet = [];

    for(let i = offset; i < offset + lines && i < records.length; i++) {
      displaySet.push(records[i]);
    }

    // check for results that meet the criteria
    if(displaySet.length < 1) {
      this.notFound(message);
      return;
    }

    // get Max Value
    const maxVal = records[0].count;

    // generate response
    let response = '';
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

    if(display === 'page') {
      response += '\n Page ' + page + ' of ' + Math.ceil(records.length/DEFAULT_LINES) + '.';
    }

    message.channel.send(response);
  }

  notFound(message) {
    message.channel.send("Nothing to display.");
  }

  invalid(message) {
    message.channel.send("I don't know how to do that.");
  }
}

module.exports = Nanami;
