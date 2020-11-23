const stickers = require('../service/stickers');
const helpers = require ('../helpers');
const configs = require('../configs');

function use(msg, name) {
  if(name) {
    msg.delete();
    stickers.getSticker(name)
    .then((sticker) => {
      helpers.msgOnBehalf(msg, `**${name}**`, msg.author.id, [{ image: { url: sticker.url }}]);
    })
    .catch(() => msg.channel.send(`Sticker with name **${name}** does not exist.`));
  } else {
    msg.channel.send("No sticker specified.")
  }
}

module.exports = use;
