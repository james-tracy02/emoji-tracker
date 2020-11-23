const commands = {};
const normalizedPath = require("path").join(__dirname, "commands");

require("fs").readdirSync(normalizedPath).forEach(function(file) {
  commands[file.substring(0, file.indexOf("."))] = require("./commands/" + file);
});

function execute(msg, cmd, args) {
  if(commands[cmd]) {
    commands[cmd](msg, ...args);
  }
}

module.exports = {
  execute
};
