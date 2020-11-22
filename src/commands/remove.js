const stickers = require('../service/stickers');
const helpers = require ('../helpers');
const configs = require('../configs');

function remove(msg, args) {
  const name = args[0];

  if(name) {
    stickers.deleteSticker(name)
    .then(() => msg.channel.send(`Deleted sticker **${name}**`))
    .catch(() => msg.channel.send(`Sticker with name **${name}** does not exist.`));
  } else {
    msg.channel.send("Invalid sticker command.")
  }
}

module.exports = remove;
