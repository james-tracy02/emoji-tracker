
function printCommands(commands) {
  let commandsMsg = '';
  Object.keys(commands).forEach((cmdName) => {
    const command = commands[cmdName].meta;
    console.log(command);
    commandsMsg += `\`${command.command}\` - ${command.description}\n`;
  });
  return commandsMsg;
}

function printCommand(name, commands) {
  let command = commands[name]
  || Object.keys(commands).find((cmdName) => commands[cmdName].aliases.include(name));
  command = command.meta;
  if (!command) return '';
  let cmdMsg = '';
  cmdMsg += `\t**Description:** *${command.description}*\n`;
  cmdMsg += '\t**Aliases:** ';

  command.aliases.forEach((alias) => {
    cmdMsg += `\`${alias}\` `;
  });
  if (command.aliases.length === 0) {
    cmdMsg += '*none*';
  }
  cmdMsg += `\n\t**Usage:** \`${command.usage}\`\n`;
  if (Object.keys(command.parameters).length !== 0) {
    cmdMsg += '\t**Parameters:**\n';
    Object.keys(command.parameters).forEach((parameterName) => {
      const parameter = command.parameters[parameterName];
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
