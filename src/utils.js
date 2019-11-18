/**
 * get obj value
 * @param object
 * @param path
 * @param defaultValue
 * @returns {*}
 */
export function get (object, path, defaultValue) {
  return (!Array.isArray(path) ? path.replace(/\[/g, '.').replace(/\]/g, '').split('.') : path)
    .reduce((o, k) => (o || {})[k], object) || defaultValue
}

/**
 * round number
 * @param number
 * @param length
 * @returns {number}
 */
export function round(number, length) {
  return +number.toFixed(length);
}
