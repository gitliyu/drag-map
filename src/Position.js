import Base from './Base';
import { get, round, isMobile } from './utils'

class Position extends Base {

  constructor (params = {}) {
    super(params);

    this.initElements();
  }

  /**
   * 初始化事件对象
   */
  initElements () {
    const list = this.document.querySelector(this.list);
    const map = this.document.querySelector(this.map);
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
    this.getMapPosition(map);

    if (isMobile()) {
      this.bindMobileEvents(listTargets, mapTargets);
    } else {
      this.bindEvents(map, listTargets, mapTargets)
    }
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
   * 绑定移动端事件
   * @param listTargets 列表中的拖拽对象
   * @param mapTargets  目标区域中的拖拽对象
   */
  bindMobileEvents (listTargets, mapTargets) {
    this.bindMobileTargetEvents(listTargets, 'add');
    this.bindMobileTargetEvents(mapTargets, 'edit');
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
        this.activeTarget = {
          targetOffsetX: event.offsetX,
          targetOffsetY: event.offsetY,
        };
        this.onDragStart();
      };
    });
  }

  /**
   * 移动端对拖拽对象绑定事件
   * @param targets
   * @param action
   */
  bindMobileTargetEvents (targets, action = 'add') {
    targets.forEach((item, index) => {
      item.ontouchstart = event => {
        this.onTouchStart(event, item, index, action);
        event.preventDefault();
      };
      item.ontouchmove = event => {
        this.onTouchMove(event, item, action);
        event.preventDefault();
      };
      item.ontouchend = event => {
        this.onTouchEnd(event, item, action);
        event.preventDefault();
      }
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
   * @param event
   * @param item
   * @param index
   * @param action
   */
  onTouchStart (event, item, index, action = 'add') {
    const position = this.getPosition(item);
    const x = get(event, 'targetTouches.0.clientX');
    const y = get(event, 'targetTouches.0.clientY');
    this.action = action;
    this.activeIndex = index;
    this.activeTarget = {
      x, y,
      left: position.left,
      top: position.top,
      targetOffsetX: x - position.left,
      targetOffsetY: y - position.top,
    };

    if (action === 'add') {
      const target = item.cloneNode(true);
      this.activeTargetId = Date.now();
      target.id = this.activeTargetId;
      target.style.cssText = `position: fixed; left: ${position.left}px; top: ${position.top}px;`;
      this.document.querySelector(this.list).appendChild(target)
    }
  }

  /**
   * @param event
   * @param item
   * @param action
   */
  onTouchMove (event, item, action = 'add') {
    const target = action === 'add' ? document.getElementById(this.activeTargetId) : item;
    const x = get(event, 'targetTouches.0.clientX');
    const y = get(event, 'targetTouches.0.clientY');
    let left = this.activeTarget.left + x - this.activeTarget.x;
    let top = this.activeTarget.top + y - this.activeTarget.y;
    if (action === 'edit') {
      left -= this.mapPosition.left;
      top -= this.mapPosition.top;
    }

    target.style.left = `${left}px`;
    target.style.top = `${top}px`;
  }

  /**
   * @param event
   * @param item
   * @param action
   */
  onTouchEnd (event, item, action = 'add') {
    if (action === 'add') {
      const target = document.getElementById(this.activeTargetId);
      this.document.querySelector(this.list).removeChild(target);
    }

    const x = get(event, 'changedTouches.0.clientX');
    const y = get(event, 'changedTouches.0.clientY');
    if (this.inMap(x, y)) {
      const dragData = this.getDragData({ x, y });
      this.emit('drop', dragData, event);
    } else {
      const left = this.activeTarget.left - this.mapPosition.left;
      const top = this.activeTarget.top - this.mapPosition.top;

      item.style.left = `${left}px`;
      item.style.top = `${top}px`;
    }
  }

  /**
   * 获取拖拽数据
   * @param event
   * @returns {{offsetX: number, percentY: *, percentStyle: string, offsetY: number, percentX: *, action: string, index: number, style: string}}
   */
  getDragData (event) {
    let offsetX = event.x - get(this.mapPosition, 'left') - get(this.activeTarget, 'targetOffsetX');
    let offsetY = event.y - get(this.mapPosition, 'top') - get(this.activeTarget, 'targetOffsetY');
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
    return target === this.document.querySelector(this.map);
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
   * 判断坐标点是否在地图上
   * @param x
   * @param y
   * @returns {boolean}
   */
  inMap (x, y) {
    return this.mapPosition.left < x && this.mapPosition.left + this.mapWidth > x
      && this.mapPosition.top < y && this.mapPosition.top + this.mapHeight > y;
  }

  /**
   * 重新获取目标元素并绑定事件
   */
  refresh () {
    this.initElements();
  }
}

export default Position;
