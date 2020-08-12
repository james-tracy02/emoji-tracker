const emoji = require('./commands/emoji');
const users = require('./commands/users');

const commands = {
  emoji,
  users,
};

function execute(msg, cmd, args) {
  if(commands[cmd]) {
    commands[cmd](msg, args);
  }
}

module.exports = {
  execute
};
