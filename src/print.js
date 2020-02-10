
const commands = require('./commands.json');

function printCommands() {
  let commandsMsg = '';
  commands.forEach((command) => {
    commandsMsg += `\`${command.command}\` - ${command.description}\n`;
  });
  return commandsMsg;
}

function printCommand(name) {
  const command = commands.find((template) => template.command === name
                                           || template.aliases.includes(name));
  if (!command) return '';
  let cmdMsg = '';
  cmdMsg += `\t**Description:** *${command.description}*\n`;
  cmdMsg += '\t**Aliases:** ';

  command.aliases.forEach((alias) => {
    cmdMsg += `\`${alias}\` `;
  });
  cmdMsg += `\n\t**Usage:** \`${command.usage}\`\n`;
  if (command.parameters.length !== 0) {
    cmdMsg += '\t**Parameters:**\n';
    command.parameters.forEach((parameter) => {
      cmdMsg += `\t\t\u2022 **${parameter.name}**:`;
      cmdMsg += `*${parameter.description}*`;
      if (parameter.optional) cmdMsg += ' (Optional)';
      cmdMsg += '\n';
    });
  }
  return cmdMsg;
}

function printBar(count, maxValue, width) {
  const inc = width / maxValue;
  const pad = count.toString().length;
  let bar = '`';
  for (let i = 0; i < count * inc - pad; i += 1) {
    bar += ' ';
  }
  bar += `${count} \``;
  return bar;
}

function printRank(page, index) {
  let rank = '';
  if (page === 1) {
    for (let stars = 3 - index; stars > 0; stars -= 1) {
      rank += '\u2605';
    }
  }
  return rank;
}

module.exports = {
  command: printCommand,
  bar: printBar,
  rank: printRank,
  commands: printCommands,
};
