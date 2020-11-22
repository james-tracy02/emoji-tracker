const database = require("../database");
const { DataTypes, Op } = require("sequelize");

const Sticker = database.define("sticker",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    guildId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    timestamps: false
  });

Sticker.removeAttribute("id");

function createSticker(name, guildId, url) {
  return Sticker.create({ name, guildId, url });
}

function getSticker(name) {
  const whereClause = {
    name
  };

  return Sticker.findOne({ where: whereClause });
}

function deleteSticker(name) {
  const whereClause = {
    name
  };

  return Sticker.destroy({ where: whereClause });
}

module.exports = {
  createSticker,
  getSticker,
  deleteSticker,
};
