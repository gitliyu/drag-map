export function get (object, path, defaultValue) {
  return (!Array.isArray(path) ? path.replace(/\[/g, '.').replace(/\]/g, '').split('.') : path)
    .reduce((o, k) => (o || {})[k], object) || defaultValue
}

export function round(number, length) {
  return +number.toFixed(length);
}
