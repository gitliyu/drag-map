import { get } from './utils';

class Base {

  constructor (options = {}) {
    this.handlers = [];
    this.initOptions(options);
  }

  initOptions (options) {
    this.list = get(options, 'list', '#drag-list');
    this.map = get(options, 'map', '#drag-map');
    this.target = get(options, 'target', '.drag-target');
  }

  /**
   * 事件监听
   * @param type
   * @param fn
   * @returns {DragMap}
   */
  on (type, fn) {
    if (!this.handlers) {
      this.handlers = [];
    }
    if (!this.handlers[type]) {
      this.handlers[type] = [];
    }
    this.handlers[type].push(fn);
  }

  /**
   * 事件发送
   * @param args
   * @returns {DragMap}
   */
  emit (...args) {
    const type = args[0];
    const params = [].slice.call(args, 1);
    const fn = this.handlers[type];
    if (fn && fn.length) {
      fn.forEach(item => {
        item(...params);
      })
    }
  }

  /**
   * 获取元素相对页面偏移量
   * @param el
   * @returns {{top: number, left: number}}
   */
  getPosition (el) {
    const bound = el.getBoundingClientRect();
    const top = bound.top - document.documentElement.clientTop;
    const left = bound.left - document.documentElement.clientLeft;

    return {top, left};
  }
}

export default Base;
