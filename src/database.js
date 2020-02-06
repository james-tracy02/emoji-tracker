
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const uri = process.env.MONGODB_URI;

function connect() {
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
}

module.exports = connect();
