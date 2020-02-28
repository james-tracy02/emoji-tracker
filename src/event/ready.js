
const { setStatus } = require('../helpers.js');

module.exports = function (client) {
  return function () {
    setStatus(client);
  };
};
