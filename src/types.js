
function number(data) {
  return !Number.isNaN(Number(data));
}

function string() {
  return true;
}

function enumeration(data, values) {
  return values.includes(data);
}

function match(data, type) {
  if (!data) return false;

  if (type.type === 'Number') return number(data);

  if (type.type === 'String') return string();

  if (type.type === 'Enum') return enumeration(data, type.values);

  return true;
}

module.exports = {
  match,
};
