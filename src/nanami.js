
const Parse = require('./parse.js');
const Print = require('./print.js');
const recordService = require('./service.js');
const pointService = require('./pointService.js');

const DEFAULT_LINES = 20;
const DEFAULT_WIDTH = 80;
const RESPONSE_CUTOFF = 1800;
const POINT_FREQ = 0.0825;
const POINT_MIN = 1;
const POINT_MAX = 200;
const PREFIX = 'n.';
const USERID_REGEXP = /<@!?(\d*)>/;
const ID_REGEXP = /<a?:[\w|\d]*:(\d*)>/;

class Nanami {
  constructor(client) {
    this.client = client;
  }

  ready() {
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
    if (!message.content.startsWith(PREFIX)) {
      this.handleMessage(message.author.id, message);
    } else { // Otherwise parse the command and execute
      this.execute(message, Parse.command(message.content.substring(PREFIX.length)));
    }
  }

  handleMessage(authorId, message) {
    const emoji = Parse.emoji(message.content);
    recordService.recordEmoji(authorId, emoji);
    if (emoji.length > 0 && Math.random() < POINT_FREQ) {
      const points = Math.floor(Math.random() * (POINT_MAX - POINT_MIN) + POINT_MIN);
      pointService.awardPoints(authorId, points);
      message.channel.send(`Nice **${this.userToNickname(message.guild, authorId)}**!\n`
      + `You found **${points}** nanami points! I wonder what they do...`);
    }
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
        this.invalid(message, command.command);
        break;
      case 'points':
        this.points(message, command.user);
        break;
      default:
        break;
    }
  }

  // Commands
  none() {}

  help(message) {
    message.channel.send(Print.help());
  }

  view(message, target, select, index, scope) {
    const user = this.matchUser(target);
    if (user) return this.viewUser(message, user, select, index, scope);
    const emoji = this.matchEmoji(target);
    if (emoji) return this.viewEmoji(message, emoji, select, index, scope);
    return this.invalid(message, 'view');
  }

  say(message, text) {
    message.delete();
    const username = `**${this.userToNickname(message.guild, message.author.id)}:**`;
    message.channel.send(username);
    let newText = '';
    const toks = text.split(/(\s+)/);
    const emoji = [];
    toks.forEach((token) => {
      const emojiId = this.getEmojiFromName(token);
      if (emojiId) {
        emoji.push(emojiId);
        newText += this.emojiToString(emojiId);
      } else if (token === '\n') {
        if (newText.length > 0) message.channel.send(newText);
        newText = '';
      } else {
        newText += token;
      }
    });
    if (newText.length > 0) message.channel.send(newText);

    recordService.recordEmoji(message.author.id, emoji);
  }

  info(message, name) {
    message.channel.send(Print.command(name));
  }

  invalid(message) {
    message.channel.send("I don't know how to do that.");
  }

  notFound(message) {
    message.channel.send('Nothing to display.');
  }

  async points(message, user) {
    let userId = this.matchUser(user);
    if (user === 'me') userId = message.author.id;
    const points = await pointService.getPointsForUser(userId);
    const username = this.userToNickname(message.guild, userId);
    message.channel.send(`**${username}** has ${points} nanami points!`);
  }

  matchUser(target) {
    if (['me', 'my', 'server', 'all'].includes(target)) return target;
    const match = target.match(USERID_REGEXP);
    if (match) return match[1];
    return null;
  }

  matchEmoji(target) {
    const match = target.match(ID_REGEXP);
    if (match) return match[1];
    return this.getEmojiFromName(target);
  }

  async viewUser(message, user, select, index, scope) {
    let validEmoji;
    if (scope === 'global') validEmoji = this.getClientEmoji();
    if (scope === 'local') validEmoji = this.getGuildEmoji(message.guild);

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
        username = this.userToNickname(message.guild, user);
        break;
    }

    const page = ((select === 'page') ? index : 1);
    const lines = ((select === 'top') ? index : DEFAULT_LINES);
    const maxVal = records[0].count;
    const displaySet = this.getDisplaySet(message, records, page, lines);
    if (displaySet.length < 1) {
      this.notFound(message);
      return;
    }

    let response = `**${username}${scope === global ? '(Global)' : ''}:**\n`;
    response += `*Total: ${records.length}*\n`;
    displaySet.forEach((record, i) => {
      response += `${Print.bar(record.count, maxVal, DEFAULT_WIDTH)} `;
      response += `${this.emojiToString(record.emoji)} `;
      response += `${Print.rank(page, i)} `;
      response += '\n';

      // if response too long
      if (response.length >= RESPONSE_CUTOFF) {
        message.channel.send(response);
        response = '';
      }
    });
    if (select === 'page') response += `\n Page ${page} of ${Math.ceil(records.length / DEFAULT_LINES)}.`;
    message.channel.send(response);
  }

  async viewEmoji(message, emoji, select, index, scope) {
    let records = await this.getRecordsForEmoji(emoji);

    if (scope === 'local') {
      const validUsers = this.getGuildMemberIds(message.guild);
      records = records.filter((record) => validUsers.includes(record.user));
    }
    const page = ((select === 'page') ? index : 1);
    const lines = ((select === 'top') ? index : DEFAULT_LINES);
    const maxVal = records[0].count;
    const displaySet = this.getDisplaySet(message, records, page, lines);
    if (displaySet.length < 1) {
      this.notFound(message);
      return;
    }

    const emojiName = this.client.emojis.get(emoji).name;
    let response = `**${emojiName}${scope === global ? '(Global)' : ''}:**\n`;
    response += `*Total: ${records.length}*\n`;
    displaySet.forEach((record, i) => {
      response += `${Print.bar(record.count, maxVal, DEFAULT_WIDTH)} `;
      response += `${this.emojiToString(emoji)} `;
      response += `${this.userToNickname(message.guild, record.user)} `;
      response += `${Print.rank(page, i)} `;
      response += '\n';

      // if response too long
      if (response.length >= RESPONSE_CUTOFF) {
        message.channel.send(response);
        response = '';
      }
    });
    if (select === 'page') response += `\n Page ${page} of ${Math.ceil(records.length / DEFAULT_LINES)}.`;
    message.channel.send(response);
  }

  getDisplaySet(message, records, page, lines) {
    const offset = (page - 1) * DEFAULT_LINES;

    const displaySet = [];
    for (let i = offset; i < offset + lines && i < records.length; i += 1) {
      displaySet.push(records[i]);
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
      if (!member.user.bot) {
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
    const targetEmoji = this.client.emojis.find((emoji) => emoji.name === name);
    if (targetEmoji) return targetEmoji.id;
    return null;
  }

  emojiToString(emojiId) {
    const targetEmoji = this.client.emojis.find((emoji) => emoji.id === emojiId);
    return targetEmoji.toString();
  }

  userToNickname(guild, user) {
    if (guild.members.has(user)) {
      return guild.members.get(user).displayName;
    }
    return this.client.users.get(user).username;
  }
}

module.exports = Nanami;
