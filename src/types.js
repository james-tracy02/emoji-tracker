'use strict';

const USERID_REGEXP = /<@!?(\d*)>/;
const ID_REGEXP = /<a?:[\w|\d]*:(\d*)>/;

function match(data, type) {
  if(type.type === 'Number')
    return number(data);

  if(type.type === 'String')
    return string(data);

  if(type.type === 'Enum')
    return enumeration(data, type.values);
}

function number(data) {
  return !isNaN(data);
}

function string(data) {
  return true;
}

function enumeration(data, values) {
  return values.includes(data);
}

module.exports = {
  match,
}
