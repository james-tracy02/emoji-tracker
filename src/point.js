
const mongoose = require('mongoose');

const { Schema } = mongoose;


const pointSchema = new Schema({
  user: String,
  points: Number,
});

const Point = mongoose.model('Point', pointSchema);


module.exports = Point;
