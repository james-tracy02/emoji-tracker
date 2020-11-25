const stickers = require('../service/stickers');
const helpers = require ('../helpers');
const configs = require('../configs');

function use(msg, name) {
  if(name) {
    msg.delete().catch(err => console.error(err));;
    stickers.getSticker(name)
    .then((sticker) => {
      helpers.msgOnBehalf(msg, "", msg.author.id, sticker.url);
    })
    .catch(() => msg.channel.send(`Sticker with name **${name}** does not exist.`));
  } else {
    msg.channel.send("No sticker specified.")
  }
}

module.exports = use;
