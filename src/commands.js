const emoji = require('./commands/emoji');
const users = require('./commands/users');
const big = require('./commands/big');
const help = require('./commands/help');
const add = require('./commands/add');

const commands = {
  emoji,
  users,
  big,
  help,
  add,
};

function execute(msg, cmd, args) {
  if(commands[cmd]) {
    commands[cmd](msg, args);
  }
}

module.exports = {
  execute
};
