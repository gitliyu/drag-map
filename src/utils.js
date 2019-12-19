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
  return +(+number).toFixed(length);
}

/**
 * deep clone object
 * @param obj
 * @returns {Array}
 */
export function clone (obj) {
  const objClone = Array.isArray(obj) ? [] : {};
  if (obj && typeof obj === "object") {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] && typeof obj[key] === "object") {
          objClone[key] = clone(obj[key]);
        } else {
          objClone[key] = obj[key];
        }
      }
    }
  }
  return objClone;
}
