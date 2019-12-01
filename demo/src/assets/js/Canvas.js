import Base from './Base';
import { get, round } from './utils';

class Canvas extends Base {

  constructor (options = {}) {
    super(options);
    this.images = get(options, 'images', []);
    this.data = get(options, 'data', []);

    this.initElements();
    this.initCanvas();
  }

  /**
   * 初始化事件对象
   */
  initElements () {
    const list = document.querySelector(this.list);
    const map = document.querySelector(this.map);
    if (!list) {
      return console.warn('Object list not found:', this.list);
    }
    if (!map) {
      return console.warn('Object map not found:', this.map);
    }

    const targets = list.querySelectorAll(this.target);
    if (!targets) {
      return console.warn('Object target not found:', this.target);
    }

    this.mapWidth = map.offsetWidth;
    this.mapHeight = map.offsetHeight;

    this.mapPosition = this.getPosition(map);
    this.bindEvents(map, targets);
  }

  bindEvents (map, targets) {
    this.bindTargetEvents(targets);

    map.ondragenter = event => {
      this.onDragEnter(event);
    };
    map.ondragover = event => {
      this.onDragOver(event);
    };
    map.ondragleave = event => {
      this.onDragLeave(event);
    };
    map.ondrop = event => {
      this.onDrop(event);
    };
  }

  /**
   * 对拖拽对象绑定事件
   * @param targets
   */
  bindTargetEvents (targets) {
    targets.forEach((target, index) => {
      target.setAttribute('draggable', true);
      target.ondragstart = event => {
        this.activeIndex = index;
        this.activeTarget = {
          x: event.offsetX,
          y: event.offsetY,
          width: target.clientWidth,
          height: target.clientHeight
        };

        this.onDragStart();
      };
    });
  }

  /**
   * 拖拽开始
   * @param event
   */
  onDragStart (event) {
    this.emit('dragstart', {
      index: this.activeIndex
    }, event);
  }

  /**
   * 拖拽进入目标区域
   * @param event
   */
  onDragEnter (event) {
    this.emit('dragenter', event);
  }

  /**
   * 在目标区域中拖拽移动
   * @param event
   */
  onDragOver (event) {
    this.emit('dragover', event);
    event.preventDefault()
  }

  /**
   * 拖拽完成
   * @param event
   */
  onDrop (event) {
    let offsetX = event.x - get(this.mapPosition, 'left') - get(this.activeTarget, 'x');
    let offsetY = event.y - get(this.mapPosition, 'top') - get(this.activeTarget, 'y');
    const percentX = round(offsetX / this.mapWidth, 4);
    const percentY = round(offsetY / this.mapHeight, 4);

    const dropData = {
      index: this.activeIndex,
      x: percentX,
      y: percentY
    };
    this.data.unshift(dropData);
    this.drawImage(dropData);

    this.emit('drop', event);
  }

  /**
   * 拖拽离开
   * @param event
   */
  onDragLeave (event) {
    this.emit('dragleave', {
      index: this.activeIndex
    }, event);
  }

  initCanvas () {
    this.canvas = document.querySelector(this.map);
    this.context = this.canvas.getContext('2d');

    this.canvas.width =  this.canvas.offsetWidth;
    this.canvas.height =  this.canvas.offsetHeight;

    // todo canvas scale
    this.scale = 1;
  }

  drawImage (data) {
    const { index, x, y } = data;
    const list = document.querySelector(this.list);
    const img = list.querySelectorAll('img')[index];

    this.context.drawImage(
      img,
      0, 0,
      img.width, img.height,
      x * this.canvas.width, y * this.canvas.height,
      img.width * this.scale, img.height * this.scale
    );
  }

}

export default Canvas;
