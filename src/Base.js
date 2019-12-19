import { get } from './utils';

class Base {

  constructor (params = {}) {
    this.handlers = [];
    this.initParams(params);
  }

  /**
   * 初始化参数
   * @param params
   */
  initParams (params) {
    this.params = params || {};
    this.document = get(params, 'document', document);
    this.list = get(params, 'list', '#drag-list');
    this.map = get(params, 'map', '#drag-map');
    this.target = get(params, 'target', '.drag-target');
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
   * 获取并监听地图偏移
   * @param map
   */
  getMapPosition (map) {
    this.mapPosition = this.getPosition(map);

    document.onscroll = () => {
      this.mapPosition = this.getPosition(map);
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
