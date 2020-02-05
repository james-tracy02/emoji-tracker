'use strict';

const commands = require('./commands.json');

const Types = require('./types.js');

const USERID_REGEXP = /<@!?(\d*)>/;
const ID_REGEXP = /<a?:[\w|\d]*:(\d*)>/;
const EMOJI_REGEXP = /<a?:[\w|\d]*:\d*>/g;

function command(message) {
  const tokens = tokenize(message);
  const template = getTemplate(tokens[0]);

  if(!template)
    return { type: 'none' };

  return parameterize(tokens, template);
}

function emoji(message) {
  const emoji = message.match(EMOJI_REGEXP);
  let ids = [];
  if(emoji) {
    emoji.forEach((item) => {
      const id = item.match(ID_REGEXP)[1];
      ids.push(id);
    });
  }
  return ids;
}

function tokenize(message) {
  return message.split(/[\s+]/);
}

function getTemplate(alias) {
  if(!alias)
    return;

  const template = commands.find(command => command.aliases.includes(alias));

  if(!template)
    return;

  return template;
}

function parameterize(tokens, template) {
  const command = { type: template.command };
  let n = 1; // The current token
  let i = 0; // The current parameter
  while(i < template.parameters.length) {
    const parameter = template.parameters[i];
    const token = tokens[n];
    if(Types.match(token, parameter.type)) {
      command[parameter.name] = token;
      n++;
    } else if(parameter.optional) { // Parameter optional and token did not match
      command[parameter.name] = parameter.default;
    } else { // Parameter is *not* optional and token did not match
      return {type: 'invalid', command: command };
    }
    i++;
  }
  // Too many tokens given
  if(n < tokens.length - 1) {
    return { type: 'invalid', command: command };
  }
  return command;
}

module.exports = {
  command,
  emoji
};
