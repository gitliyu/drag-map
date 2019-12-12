import Base from './Base';
import { get, round } from './utils'

class Position extends Base {

  constructor (params = {}) {
    super(params);

    this.initElements();
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

    const listTargets = list.querySelectorAll(this.target);
    const mapTargets = map.querySelectorAll(this.target);
    if (!listTargets || !listTargets.length) {
      return console.warn('Object target not found:', this.target);
    }

    this.mapWidth = map.offsetWidth;
    this.mapHeight = map.offsetHeight;

    this.targets = [...listTargets, ...mapTargets];
    this.mapPosition = this.getPosition(map);
    this.bindEvents(map, listTargets, mapTargets);
  }

  /**
   * 绑定事件
   * @param map
   * @param listTargets 列表中的拖拽对象
   * @param mapTargets  目标区域中的拖拽对象
   */
  bindEvents (map, listTargets, mapTargets) {
    this.bindTargetEvents(listTargets, 'add');
    this.bindTargetEvents(mapTargets, 'edit');

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
   * @param action 'add'|'edit'
   */
  bindTargetEvents (targets, action = 'add') {
    targets.forEach((target, index) => {
      target.setAttribute('draggable', true);
      target.ondragstart = event => {
        this.action = action;
        this.activeIndex = index;
        const attributes = {
          targetOffsetX: event.offsetX,
          targetOffsetY: event.offsetY,
        };

        Object.keys(attributes).forEach(key => {
          event.dataTransfer.setData(key, attributes[key]);
        });
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
      action: this.action,
      index: this.activeIndex
    }, event);
  }

  /**
   * 拖拽进入目标区域
   * @param event
   */
  onDragEnter (event) {
    const dragData = this.getDragData(event);
    this.emit('dragenter', dragData, event);
  }

  /**
   * 在目标区域中拖拽移动
   * @param event
   */
  onDragOver (event) {
    const dragData = this.getDragData(event);
    this.emit('dragover', dragData, event);
    event.preventDefault()
  }

  /**
   * 拖拽完成
   * @param event
   */
  onDrop (event) {
    const dragData = this.getDragData(event);
    this.emit('drop', dragData, event);
  }

  /**
   * 拖拽离开
   * @param event
   */
  onDragLeave (event) {
    if (!this.isMap(get(event, 'target')) || this.isTarget(get(event, 'fromElement'))) {
      return;
    }
    if (this.action === 'add') {
      return;
    }
    this.emit('dragleave', {
      index: this.activeIndex
    }, event);
  }

  /**
   * 获取拖拽数据
   * @param event
   * @returns {{offsetX: number, percentY: *, percentStyle: string, offsetY: number, percentX: *, action: string, index: number, style: string}}
   */
  getDragData (event) {
    const attributes = {};
    const fields = ['targetOffsetX', 'targetOffsetY'];
    fields.forEach(item => {
      attributes[item] = event.dataTransfer.getData(item);
    });

    let offsetX = event.x - get(this.mapPosition, 'left') - get(attributes, 'targetOffsetX');
    let offsetY = event.y - get(this.mapPosition, 'top') - get(attributes, 'targetOffsetY');
    const percentX = round(offsetX / this.mapWidth * 100, 2);
    const percentY = round(offsetY / this.mapHeight * 100, 2);

    return {
      action: this.action,
      index: this.activeIndex,
      offsetX,
      offsetY,
      percentX,
      percentY,
      style: `left: ${offsetX}px;top: ${offsetY}px;`,
      percentStyle:`left: ${percentX}%;top: ${percentY}%;`
    };
  }

  /**
   * 判断是否为目标区域
   * @param target
   * @returns {boolean}
   */
  isMap (target) {
    return target === document.querySelector(this.map);
  }

  /**
   * 判断是否为拖拽对象
   * @param target
   * @returns {boolean}
   */
  isTarget (target) {
    return this.targets.includes(target);
  }

  /**
   * 重新获取目标元素并绑定事件
   */
  refresh () {
    this.initElements();
  }
}

export default Position;
