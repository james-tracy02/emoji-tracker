const Mongo = require('mongodb').MongoClient;
const dotenv = require("dotenv"); dotenv.config();

const url = process.env.MONGODB_URI;
const mongoClient = new Mongo(url);

class UsersRepository {
  constructor() {
    mongoClient.connect((err) => {
      if(!err) {
        console.log('connected to mongo');
      }
    });
  }

  updateAsync(id, summary) {
    const db = mongoClient.db();
    const users = db.collection('users');

    users.findOne({userId: id})
    .then((user) => {
      // if user not found
      if(!user) {
        const newUser = {userId: id, emoji: []};
        Object.keys(summary).forEach((emojiId) => {
          newUser.emoji.push({emojiId: emojiId, count: summary[emojiId]});
        });
        users.insertOne(newUser);
      } else {
        const updatedUser = {userId: id, emoji: user.emoji};
        Object.keys(summary).forEach((emojiId) => {
          const idx = user.emoji.findIndex((item) => item.emojiId === emojiId);
          if(idx === -1) {
            updatedUser.emoji.push({emojiId: emojiId, count: summary[emojiId]});
          } else {
            updatedUser.emoji[idx] = {emojiId: emojiId, count: user.emoji[idx].count + summary[emojiId]};
          }
        });
        users.replaceOne({userId: id}, updatedUser);
      }
    });
  }

  retrieveOneAsync(id, callback) {
    const db = mongoClient.db();
    const users = db.collection('users');

    users.findOne({userId: id}, callback);
  }

  retrieveManyAsync(ids, callback) {
    const db = mongoClient.db();
    const users = db.collection('users');

    users.find({userId: {$in: ids}}).toArray(callback);
  }
}

module.exports = UsersRepository;
