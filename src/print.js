
const commands = require('./commands.json');

function printHelp() {
  let helpMsg = '**Emoji Tracker** ***Nanami Bot***\n\n';
  helpMsg += '**Commands:**\n';
  helpMsg += '*Say* `n.info <command>` *to find out more!*\n\n';
  commands.forEach((command) => {
    helpMsg += `\`${command.command}\` - ${command.description}\n`;
  });
  return helpMsg;
}

function printCommand(name) {
  const command = commands.find((template) => template.command === name
                                           || template.aliases.includes(name));
  if (!command) return '';
  let cmdMsg = `**Command:** ${command.command}\n`;
  cmdMsg += `\t**Description:** *${command.description}*\n`;
  cmdMsg += '\t**Aliases:** ';

  command.aliases.forEach((alias) => {
    cmdMsg += `\`${alias}\` `;
  });
  cmdMsg += `\n\t**Usage:** \`${command.usage}\`\n`;
  if (command.parameters.length !== 0) {
    cmdMsg += '\t**Parameters:**\n';
    command.parameters.forEach((parameter) => {
      cmdMsg += `\t\t**${parameter.name}** [${parameter.type.type}]:`;
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
  help: printHelp,
  command: printCommand,
  bar: printBar,
  rank: printRank,
};
