
const commands = require('./command');
const types = require('./types.js');

const ID_REGEXP = /<a?:[\w|\d]*:(\d*)>/;
const EMOJI_REGEXP = /<a?:[\w|\d]*:\d*>/g;

function tokenize(message) {
  const matches = [...message.matchAll(/[^\s\"]+|\"([^\"]+)\"/g)];
  return matches.map((match) => {
    if (match[1]) return match[1];
    return match[0];
  });
}

function getMeta(name) {
  if (!name) return null;
  const cmd = commands[name]
  || commands[Object.keys(commands).find((cmdName) => commands[cmdName].meta.aliases.includes(name))];
  if (!cmd) return null;
  return cmd.meta;
}

function parameterize(tokens, meta) {
  const cmd = { type: meta.command };
  let n = 1; // The current token
  let i = 0; // The current parameter
  const params = Object.keys(meta.parameters);
  while (i < params.length) {
    const param = meta.parameters[params[i]];
    const token = tokens[n];
    if (types.match(token, param.type)) {
      cmd[param.name] = token;
      n += 1;
    } else if (param.optional) { // Parameter optional and token did not match
      cmd[param.name] = param.default;
    } else { // Parameter is *not* optional and token did not match
      return null;
    }
    i += 1;
  }
  return cmd;
}

module.exports = function (message) {
  const tokens = tokenize(message);
  const meta = getMeta(tokens[0]);
  if (!meta) return null;
  return parameterize(tokens, meta);
};
