import Canvas from './Canvas'
import Position from './Position'

class DragMap {

  constructor (params = {}) {
    const { type } = params;

    if (type === 'canvas') {
      return new Canvas(params);
    } else {
      return new Position(params);
    }
  }
}

export default DragMap;
