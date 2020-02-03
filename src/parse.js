'use strict';

const COMMAND_PREFIX = '.nanami ';
const USERID_REGEXP = /<@!?(\d*)>/;
const ID_REGEXP = /<a?:[\w|\d]*:(\d*)>/;
const EMOJI_REGEXP = /<a?:[\w|\d]*:\d*>/g;

function parseCommand(message) {
  if(!message.content.startsWith(COMMAND_PREFIX))
    return;

  const raw = message.content.substring(COMMAND_PREFIX.length);
  const toks = raw.split(/[\s+]/);
  if(toks.length === 0) {
    return { type: 'INVALID', message: message };
  }

  const name = toks[0];

  switch (name) {
    case 'help':
      return { type: 'HELP', message: message };
    case 'view':
      return parseViewCommand(message, toks);
    case 'msg':
      let text = message.content.substring(COMMAND_PREFIX.length + 4);
      return { type: 'MSG', message: message, text: text };
    default:
      return { type: 'IVALID', message: message };
  }
}

function parseViewCommand(message, toks) {
  if(!toks[1])
    return { type: 'INVALID_VIEW', message: message };

  let command = { message: message  };
  let user = getUser(toks[1]);
  let emoji = getEmoji(toks[1]);
  if(user) {
    command.type = 'VIEW_USER';
    command.user = user;
  } else if(emoji) {
    command.type = 'VIEW_EMOJI';
    command.emoji = emoji;
  } else {
    command.type = 'VIEW_EMOJI';
    command.emojiName = toks[1];
  }

  if(toks[2]) {
    if(toks[2] === 'global' || toks[2] === 'local') {
      command.scope = toks[2];
      if(toks[3]) {
        if (toks[3] === 'page' || toks[3] == 'top') {
          command.display = toks[3];
          if(toks[4] && !isNaN(toks[4])) {
            command.count = toks[4];
          } else {
            return { type: 'INVALID_VIEW', message: message };
          }
        }
      }
    } else if (toks[2] === 'page' || toks[2] == 'top') {
      command.display = toks[2];
      if(toks[3] && !isNaN(toks[3])) {
        command.count = toks[3];
      } else {
        return { type: 'INVALID_VIEW', message: message };
      }
    } else {
      return { type: 'INVALID_VIEW', message: message };
    }
  }

  return command;
}

function getUser(tok) {
  if(['me', 'my', 'server', 'all'].includes(tok)) {
    return tok;
  }
  const match = tok.match(USERID_REGEXP);
  if(match)
    return match[1];
  return null;
}

function getEmoji(tok) {
  const match = tok.match(ID_REGEXP);
  if(match)
    return match[1];
}

function parseEmoji(message) {
  const content = message.content;
  const emoji = content.match(EMOJI_REGEXP);
  let ids = [];
  if(emoji) {
    emoji.forEach((item) => {
      const id = item.match(ID_REGEXP)[1];
      ids.push(id);
    });
  }
  return ids;
}

module.exports = {
  parseCommand,
  parseEmoji
};
