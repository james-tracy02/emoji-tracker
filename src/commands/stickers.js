const stickersService = require('../service/stickers');
const helpers = require ('../helpers');

function stickers(msg) {
  stickersService.getStickers()
  .then((stickers) => {
    helpers.list(msg, "Stickers", stickers.map((sticker) => sticker.name));
  });
}

module.exports = stickers;
