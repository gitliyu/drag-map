import { get } from './utils';

class Base {

  constructor (options = {}) {
    this.initOptions(options);
  }

  initOptions (options) {
    this.list = get(options, 'list', '#drag-list');
    this.map = get(options, 'map', '#drag-map');
    this.target = get(options, 'target', '.drag-target');
  }

}

export default Base;
