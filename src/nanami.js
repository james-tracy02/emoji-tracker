
const Discord = require('discord.js');
const Parse = require('./parse.js');
const Print = require('./print.js');
const recordService = require('./service.js');
const pointService = require('./pointService.js');

const DEFAULT_LINES = 20;
const DEFAULT_WIDTH = 80;
const RESPONSE_CUTOFF = 1800;
const POINT_FREQ = 0.04;
const POINT_MIN = 1;
const POINT_MAX = 200;
const PREFIX = 'n.';
const USERID_REGEXP = /<@!?(\d*)>/;
const ID_REGEXP = /<a?:[\w|\d]*:(\d*)>/;
const WEBHOOK_NAME = 'Nanami Webhook';
const NAME_REGEXP = /:([\w\d]*)(?:-(\d+))?:(?!\d+)/g;

const COLOR = '#EBC8CB';

class Nanami {
  constructor(client) {
    this.client = client;
  }

  ready() {
    this.setStatus();
  }

  setStatus() {
    this.client.user.setActivity(`emojis in ${this.client.guilds.size} servers!`, { type: 'WATCHING' });
  }

  recordReaction(reaction, user) {
    recordService.recordEmoji(user.id, [reaction.emoji.id]);
  }

  read(message) {
    if (!message.content.startsWith(PREFIX)) {
      this.handleMessage(message.author.id, message);
    } else {
      this.execute(message, Parse.command(message.content.substring(PREFIX.length)));
    }
  }

  async handleMessage(authorId, message) {
    const res = this.replaceNitroEmoji(message);
    if (res) this.say(message, res);
    const emoji = Parse.emoji(res || message.content);
    recordService.recordEmoji(authorId, emoji);
  }

  replaceNitroEmoji(message) {
    let newContent = '';
    let index = 0;
    const matches = [...message.content.matchAll(NAME_REGEXP)];
    if (matches.length === 0) return null;
    matches.forEach((match) => {
      const emojiObj = this.getEmojiFromMatch(message, match);
      if (emojiObj) {
        newContent += message.content.substring(index, match.index) + emojiObj.toString();
        index = match.index + match[0].length;
      }
    });
    newContent += message.content.substring(index);
    return newContent;
  }

  getEmojiFromMatch(message, match) {
    const emojiName = match[1];
    const i = match[2];
    let emojiObj;
    if (i) {
      const possibleEmojis = this.client.emojis.filter((emoji) => emoji.name === emojiName);
      emojiObj = Array.from(possibleEmojis)[i - 1][1];
    } else {
      emojiObj = message.guild.emojis.find((emoji) => emoji.name === emojiName);
      if (!emojiObj) emojiObj = this.client.emojis.find((emoji) => emoji.name === emojiName);
    }
    return emojiObj;
  }

  async webhookSay(content, message) {
    await message.delete();
    const webhooks = await message.channel.fetchWebhooks();
    let nanamiWebhook = webhooks.find((webhook) => webhook.name === WEBHOOK_NAME);
    if (!nanamiWebhook) {
      /* maintains one webhook only but i dont care
      const allWebhooks = await message.guild.fetchWebhooks();
      const alterEgo = allWebhooks.find((webhook) => webhook.name === WEBHOOK_NAME);
      if (alterEgo) await alterEgo.delete();
      */
      nanamiWebhook = await message.channel.createWebhook(WEBHOOK_NAME, this.client.user.avatarURL);
    }
    await nanamiWebhook.send(content,
      { username: message.member.displayName, avatarURL: message.author.avatarURL });
  }

  rollPoints(authorId, message) {
    if (Math.random() < POINT_FREQ) {
      const points = Math.floor(Math.random() * (POINT_MAX - POINT_MIN) + POINT_MIN);
      pointService.awardPoints(authorId, points);
      message.channel.send(`Nice **${this.userToNickname(message.guild, authorId)}**!\n`
      + `You found **${points}** nanami points!`);
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
      case 'big':
        this.big(message, command.emoji);
        break;
      case 'random':
        this.random(message);
        break;
      case 'invite':
        this.invite(message);
        break;
      case 'add':
        this.add(message, command.emoji, command.name);
        break;
      case 'list':
        this.list(message, command.page);
        break;
      case 'search':
        this.search(message, command.keyword, command.page);
        break;
      default:
        break;
    }
  }

  // Commands
  none() {}

  help(message) {
    const helpEmbed = new Discord.RichEmbed()
      .setColor(COLOR)
      .setTitle('Nanami Bot | Prefix .n')
      .setAuthor('Emoji Tracker', this.client.user.avatarURL)
      .setDescription(`${'I give you new ways to interact with and use emojis.\n\n'
      + '**Commands**\n'
      + '*Say* `n.info <command>` *to find out more!*\n\n'}${
        Print.commands()}`)
      .setFooter('Made by Fyre_Fli#4138',
        'https://cdn.discordapp.com/avatars/265902301443653644/993314979e5e569cd368a71d1881a34d.png');
    message.channel.send(helpEmbed);
  }

  view(message, target, select, index, scope) {
    const user = this.matchUser(target);
    if (user) return this.viewUser(message, user, select, index, scope);
    const emoji = this.matchEmoji(message, target);
    if (emoji) return this.viewEmoji(message, emoji, select, index, scope);
    return this.invalid(message, 'view');
  }

  async say(message, text) {
    message.delete();

    const userEmbed = this.getUserEmbed(message);
    await message.channel.send(userEmbed);

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
    const description = Print.command(name);
    if (description === '') {
      message.channel.send('Invalid command name.');
      return;
    }
    const infoEmbed = new Discord.RichEmbed()
      .setColor(COLOR)
      .setTitle(name)
      .setDescription(description);
    message.channel.send(infoEmbed);
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

  async big(message, emoji) {
    message.delete();
    const match = this.matchEmoji(message, emoji);
    if (!match) {
      message.channel.send('Invalid emoji.');
      return;
    }
    const { url } = this.client.emojis.get(match);
    const bigEmbed = this.getUserEmbed(message);
    bigEmbed.setImage(url);
    await message.channel.send(bigEmbed);
    this.rollPoints(message.author.id, message);
    recordService.recordEmoji(message.author.id, [match]);
  }

  random(message) {
    const emoji = this.getRandomEmoji();
    this.big(message, emoji);
  }

  invite(message) {
    const inviteEmbed = new Discord.RichEmbed()
      .setColor(COLOR)
      .setTitle('Click here to invite me to your server!')
      .setAuthor('Emoji Tracker', this.client.user.avatarURL)
      .setURL('https://discordapp.com/oauth2/authorize?client_id=624386401735147531&permissions=604318784&scope=bot')
      .setFooter('Made by Fyre_Fli#4138',
        'https://cdn.discordapp.com/avatars/265902301443653644/993314979e5e569cd368a71d1881a34d.png');
    message.channel.send(inviteEmbed);
  }

  add(message, emoji, name) {
    const emojiObj = this.client.emojis.find((e) => e.name === emoji
    && e.guild.id !== message.guild.id);
    if (!emojiObj) {
      message.channel.send('Invalid emoji!');
      return;
    }
    message.guild.createEmoji(emojiObj.url, name === '' ? emojiObj.name : name);
    const addEmbed = this.getUserEmbed(message);
    addEmbed.setDescription(`Added ${name === '' ? emojiObj.name : name} to ${message.guild.name}.`);
    addEmbed.setImage(emojiObj.url);
    message.channel.send(addEmbed);
  }

  list(message, page) {
    message.channel.send(this.listEmoji(this.client.emojis, 'Emoji Catalog:', page));
  }

  search(message, keyword, page) {
    const emojis = this.client.emojis.filter((emoji) => emoji.name.toLowerCase()
      .includes(keyword.toLowerCase()));
    message.channel.send(this.listEmoji(emojis, `Results for "${keyword}":`, page));
  }

  listEmoji(emojis, title, page) {
    const listEmbed = new Discord.RichEmbed()
      .setColor(COLOR)
      .setTitle(title);
    const resPerPage = 25;
    let content = '';
    let lastName = '';
    let lastIndex = 2;
    const keys = Array.from(emojis.keys());
    for (let i = (page - 1) * resPerPage; i < page * resPerPage; i += 1) {
      const emoji = emojis.get(keys[i]);
      if (!emoji) break;
      content += emoji.toString();
      content += ` - ${emoji.name}`;
      if (lastName === emoji.name) {
        content += `-${lastIndex}`;
        lastIndex += 1;
      } else {
        lastIndex = 2;
      }
      lastName = emoji.name;
      content += '\n';
    }
    content += '\n';
    content += `Page ${page} of ${Math.ceil(keys.length / resPerPage)}.`;
    listEmbed.setDescription(content);
    return listEmbed;
  }

  getRandomEmoji() {
    const keys = Array.from(this.client.emojis.keys());
    const emojiId = keys[Math.floor(Math.random() * keys.length)];
    return this.client.emojis.get(emojiId).toString();
  }

  getUserEmbed(message) {
    const { member } = message;
    const color = member.displayHexColor;
    return new Discord.RichEmbed()
      .setColor(color === '#000000' ? '#FEFEFE' : color)
      .setAuthor(member.displayName, member.user.avatarURL);
  }

  matchUser(target) {
    if (['me', 'my', 'server', 'all'].includes(target)) return target;
    const match = target.match(USERID_REGEXP);
    if (match) return match[1];
    return null;
  }

  matchEmoji(message, target) {
    const match = target.match(ID_REGEXP);
    if (match) return match[1];
    const match2 = [...target.matchAll(NAME_REGEXP)];
    if (match2.length > 0) return this.getEmojiFromMatch(message, match2[0]).id;
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

    const displaySet = this.getDisplaySet(message, records, page, lines);
    if (displaySet.length < 1) {
      this.notFound(message);
      return;
    }
    const maxVal = records[0].count;

    let response = `**${username}${scope === global ? '(Global)' : ''}:**\n`;
    response += `*Total: ${this.total(records)}*\n`;
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

    const displaySet = this.getDisplaySet(message, records, page, lines);
    if (displaySet.length < 1) {
      this.notFound(message);
      return;
    }
    const maxVal = records[0].count;

    const emojiName = this.client.emojis.get(emoji).name;
    let response = `**${emojiName}${scope === global ? '(Global)' : ''}:**\n`;
    response += `*Total: ${this.total(records)}*\n`;
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

  total(records) {
    let total = 0;
    records.forEach((record) => {
      total += record.count;
    });
    return total;
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
