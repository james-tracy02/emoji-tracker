const stickers = require('../service/stickers');
const helpers = require ('../helpers');
const configs = require('../configs');

function sticker(msg, name, url) {
  if(name && url) {
    stickers.createSticker(name, msg.guild.id, url)
    .then(() => msg.channel.send(`Created sticker **${name}**`))
    .catch(() => msg.channel.send(`Sticker with name **${name}** already exists. Please use a different name.`));
  } else {
    msg.channel.send("Invalid sticker command.")
  }
}

module.exports = sticker;
