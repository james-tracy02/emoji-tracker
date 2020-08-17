const emoji = require('./commands/emoji');
const users = require('./commands/users');
const big = require('./commands/big');

const commands = {
  emoji,
  users,
  big,
};

function execute(msg, cmd, args) {
  if(commands[cmd]) {
    commands[cmd](msg, args);
  }
}

module.exports = {
  execute
};
