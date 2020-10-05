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

function printCommands() {
  let cmds = '';
  cmds += '**emoji <@mention | server | all>** - display emoji usage data for the given user, guild, or all emoji data, respectively.\n';
  cmds += '**users <emojiName | emoji>** - display usage data for the given emoji.\n';
  cmds += '**big <emojiName | emoji>** - render a large version of the given emoji.\n';
  cmds += '**add <emojiName | emoji>** - add the given emoji to this server\'s emojis.\n';
  cmds += '**help** - display this help message.\n';
  return cmds;
}

module.exports = {
  bar: printBar,
  rank: printRank,
  commands: printCommands,
};
