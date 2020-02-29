
const { setStatus } = require('../helpers.js');

module.exports = function (alterEgo) {
  return function () {
    setStatus(alterEgo.client);
  };
};
