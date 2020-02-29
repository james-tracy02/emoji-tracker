
module.exports = function (alterEgo) {
  return {
    add: require('./add.js')(alterEgo),
    big: require('./big.js')(alterEgo),
    list: require('./list.js')(alterEgo),
    'search-guild': require('./search-guild.js')(alterEgo),
    search: require('./search.js')(alterEgo),
    view: require('./view.js')(alterEgo),
  }
}
