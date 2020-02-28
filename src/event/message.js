
const commands = require('../command');
const parse = require('../parse.js');
const configs = require('../configs.js');
const helpers = require('../helpers.js');
const { recordEmoji } = require('../service/record.js');

module.exports = function (client) {
  return function (msg) {
    if (msg.author.bot) return;

    if (msg.content.startsWith(configs.prefix)) {
      const cmd = parse(msg.content.substring(configs.prefix.length));
      if (!cmd) return;
      return commands[cmd.type].execute(msg, cmd);
    }

    const res = helpers.replaceNitroEmoji(msg);
    if (res) helpers.msgOnBehalf(msg, res, msg.author);
    const emoji = helpers.getEmojiIds(res || msg.content);
    recordEmoji(msg.author.id, emoji);
  };
};
