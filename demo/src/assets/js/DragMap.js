import Canvas from './Canvas'
import Position from './Position'

class DragMap {

  constructor (options = {}) {
    const { type } = options;

    if (type === 'canvas') {
      return new Canvas(options);
    } else {
      return new Position(options);
    }
  }
}

export default DragMap;
