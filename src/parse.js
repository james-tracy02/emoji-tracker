
const commands = require('./commands.json');

const Types = require('./types.js');

const ID_REGEXP = /<a?:[\w|\d]*:(\d*)>/;
const EMOJI_REGEXP = /<a?:[\w|\d]*:\d*>/g;

function tokenize(message) {
  return message.split(/[\s+]/);
}

function getTemplate(alias) {
  if (!alias) return null;

  const template = commands.find((command) => command.aliases.includes(alias));

  if (!template) return null;

  return template;
}

function parameterize(tokens, template) {
  const command = { type: template.command };
  let n = 1; // The current token
  let i = 0; // The current parameter
  while (i < template.parameters.length) {
    const parameter = template.parameters[i];
    const token = tokens[n];
    if (Types.match(token, parameter.type)) {
      command[parameter.name] = token;
      n += 1;
    } else if (parameter.optional) { // Parameter optional and token did not match
      command[parameter.name] = parameter.default;
    } else { // Parameter is *not* optional and token did not match
      return { type: 'invalid', command };
    }
    i += 1;
  }
  return command;
}

function parseCommand(message) {
  const tokens = tokenize(message);
  const template = getTemplate(tokens[0]);

  if (!template) return { type: 'none' };

  return parameterize(tokens, template);
}

function parseEmoji(message) {
  const emoji = message.match(EMOJI_REGEXP);
  const ids = [];
  if (emoji) {
    emoji.forEach((item) => {
      const id = item.match(ID_REGEXP)[1];
      ids.push(id);
    });
  }
  return ids;
}

module.exports = {
  command: parseCommand,
  emoji: parseEmoji,
};
