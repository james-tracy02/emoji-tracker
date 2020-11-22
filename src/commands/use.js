const stickers = require('../service/stickers');
const helpers = require ('../helpers');
const configs = require('../configs');

function use(msg, args) {
  const name = args[0];

  if(name) {
    msg.delete();
    stickers.getSticker(name)
    .then((sticker) => {
      helpers.msgOnBehalf(msg, `*${name}*`, msg.author.id, [{ image: { url: sticker.url }}]);
    });
  } else {
    msg.channel.send("No sticker specified.")
  }
}

module.exports = use;
