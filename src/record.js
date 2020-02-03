'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const recordSchema = new Schema({
  user: String,
  emoji: String,
  count: Number
});

const Record = mongoose.model('Record', recordSchema);


module.exports = Record;
