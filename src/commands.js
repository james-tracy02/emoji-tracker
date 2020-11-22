const emoji = require('./commands/emoji');
const users = require('./commands/users');
const big = require('./commands/big');
const help = require('./commands/help');
const add = require('./commands/add');
const invite = require('./commands/invite');
const sticker = require('./commands/sticker');
const use = require('./commands/use');
const remove = require('./commands/remove');

const commands = {
  emoji,
  users,
  big,
  help,
  add,
  invite,
  sticker,
  use,
  remove,
};

function execute(msg, cmd, args) {
  if(commands[cmd]) {
    commands[cmd](msg, args);
  }
}

module.exports = {
  execute
};
