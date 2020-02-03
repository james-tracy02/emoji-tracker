'use strict';

const mongoose = require('mongoose');
const dotenv = require("dotenv"); dotenv.config();
const uri = process.env.MONGODB_URI;

class Database {
  constructor() {
    this._connect();
  }

  _connect() {
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('connected to db');
    })
    .catch(() => {
      console.log('failed to connect')
    });
  }
}

module.exports = new Database();
