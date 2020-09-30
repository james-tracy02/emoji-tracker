const database = require("../database");
const { DataTypes, Op } = require("sequelize");

const Record = database.define("record",
  {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    emojiId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    timestamps: false
  });

function getRecordsForUser(userId, time) {
  const whereClause = {
    userId: userId
  };

  if(time) {
    whereClause.time = {
      [Op.gt]: time
    }
  }

  return Record.findAll({ where: whereClause });
}

function getRecordsForUsers(userIds, time) {
  const whereClause = {
    userId: {
      [Op.in]: userIds,
    }
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
    emojiId: emojiId,
  };

  if(time) {
    whereClause.time = {
      [Op.gt]: time
    }
  }

  return Record.findAll({ where: whereClause });
}

function insertRecords(emojiIds, userId, time) {
  emojiIds.forEach(emojiId => {
    Record.create({ emojiId: emojiId, userId: userId, time: time });
  });
}

module.exports = {
  getRecordsForUser,
  getRecordsForUsers,
  getAllRecords,
  getRecordsForEmoji,
  insertRecords,
};
