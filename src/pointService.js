
const Point = require('./point.js');

// Open mongo connection
require('./database.js');

async function awardPoints(user, award) {
  const points = await Point.findOne({ user });
  if (!points) {
    const newPoints = new Point({ user, points: award });
    newPoints.save();
    return;
  }
  points.points += award;
  points.save();
}


module.exports = {
  awardPoints,
};
