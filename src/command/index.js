
require('fs').readdirSync(__dirname).forEach((file) => {
  if (file !== 'index.js') module.exports[file.slice(0, -3)] = require(`./${file}`);
});
