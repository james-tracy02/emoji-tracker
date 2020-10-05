const database = require("../database");
const { DataTypes, Op } = require("sequelize");

const Record = database.define("record",
  {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emojiId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    guildId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    timestamps: false
  });

Record.removeAttribute("id");

function getRecordsForUser(userId, time) {
  const whereClause = {
    userId,
  };

  if(time) {
    whereClause.time = {
      [Op.gt]: time
    }
  }

  return Record.findAll({ where: whereClause });
}

function getRecordsForGuild(guildId, time) {
  const whereClause = {
    guildId,
  };

  if(time) {
    whereClause.time = {
      [Op.gt]: time
    }
  }

  return Record.findAll({ where: whereClause });
}

function getAllRecords(time) {
  if(time) {
    return Record.findAll({
      where: {
        time: {
          [Op.gt]: time
        }
      }
    });
  }
  return Record.findAll();
}

function getRecordsForEmoji(emojiId, time) {
  const whereClause = {
    emojiId,
  };

  if(time) {
    whereClause.time = {
      [Op.gt]: time
    }
  }

  return Record.findAll({ where: whereClause });
}

function insertRecords(emojiIds, userId, guildId, time) {
  emojiIds.forEach(emojiId => {
    Record.create({ emojiId, userId, guildId, time });
  });
}

module.exports = {
  getRecordsForUser,
  getRecordsForGuild,
  getAllRecords,
  getRecordsForEmoji,
  insertRecords,
};
