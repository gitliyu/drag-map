import Base from './Base';
import { get, round } from './utils';

class Canvas extends Base {

  constructor (params = {}) {
    super(params);
    this.options = get(params, 'options', []);
    this.data = get(params, 'data', []);
    this.maxScale = get(params, 'maxScale', 3);
    this.minScale = get(params, 'minScale', 1);
    this.readonly = get(params, 'readonly', false);

    this.setImageSize();
    this.initElements();
    this.initCanvas();
    this.initImages(params);
  }

  /**
   * 初始化事件对象
   */
  initElements () {
    const map = document.querySelector(this.map);
    if (!map) {
      return console.warn('Object map not found:', this.map);
    }

    this.mapWidth = map.offsetWidth;
    this.mapHeight = map.offsetHeight;

    const list = document.querySelector(this.list);
    if (!list) {
      return console.warn('Object list not found:', this.list);
    }

    const targets = list.querySelectorAll(this.target);
    if (!targets) {
      return console.warn('Object target not found:', this.target);
    }

    this.getMapPosition(map);
    this.bindEvents(map, targets);
  }

  /**
   * 绑定拖拽事件
   * @param map
   * @param targets
   */
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
    this.emit('dragstart', this.getOptionBaseData(), event);
  }

  /**
   * 拖拽进入目标区域
   * @param event
   */
  onDragEnter (event) {
    this.emit('dragenter', this.getOptionBaseData(), event);
  }

  /**
   * 在目标区域中拖拽移动
   * @param event
   */
  onDragOver (event) {
    this.emit('dragover', this.getOptionBaseData(), event);
    event.preventDefault();
  }

  /**
   * 拖拽完成
   * @param event
   */
  onDrop (event) {
    let offsetX = event.x - get(this.mapPosition, 'left') - get(this.activeTarget, 'x');
    let offsetY = event.y - get(this.mapPosition, 'top') - get(this.activeTarget, 'y');
    const { left, top } = this.transformPoint(offsetX, offsetY, 1);
    const percentX = round(left / this.mapWidth, 4);
    const percentY = round(top / this.mapHeight, 4);

    const baseData = this.getOptionBaseData();
    const { image } = this.getActiveOption();
    const dropData = {...baseData, ...{
      x: percentX,
      y: percentY,
      width: this.imageSize.width || image.width,
      height: this.imageSize.height || image.height
    }};
    this.data.push(dropData);
    this.drawImage(dropData);

    this.emit('drop', event);
  }

  /**
   * 拖拽离开
   * @param event
   */
  onDragLeave (event) {
    this.emit('dragleave', this.getOptionBaseData(), event);
  }

  /**
   * 整理当前选中对象数据
   */
  getOptionBaseData () {
    const baseData = this.getActiveOption();
    delete baseData.image;
    delete baseData.url;

    return baseData;
  }

  /**
   * 获取当前选中对象数据
   * @returns {{}}
   */
  getActiveOption () {
    return {...(this.options[this.activeIndex] || {})};
  }

  /**
   * 初始化canvas
   */
  initCanvas () {
    this.canvas = document.querySelector(this.map);
    this.context = this.canvas.getContext('2d');

    this.canvas.width =  this.mapWidth;
    this.canvas.height =  this.mapHeight;

    this.scale = 1;
    this.canvasOffsetX = 0;
    this.canvasOffsetY = 0;
    this.bindCanvasEvent();
  }

  /**
   * 绑定canvas事件
   */
  bindCanvasEvent () {
    this.canvas.onmousedown = event => {
      const x = event.clientX - get(this.mapPosition, 'left');
      const y = event.clientY - get(this.mapPosition, 'top');

      const image = this.getPointInImages(x, y);
      if (image) {  // 点击图标
        this.mouseMoveImage(image, event);
      } else {  // 点击画布
        this.mouseMoveCanvas(event);
      }

      this.clickTimeout = setTimeout(() => { this.clickTimeout = 0; }, 500);
      this.canvas.onmouseup = () => {
        this.canvas.onmousemove = null;
        this.canvas.onmouseup = null;
        clearTimeout(this.clickTimeout);
        if(this.clickTimeout && image){
          this.emit('click', image);
        }
      }
    };

    this.canvas.onmousewheel = event => {
      this.mouseWheel(event);
      event.preventDefault();
    };
  }

  /**
   * 画布图像拖拽事件
   * @param image
   * @param event
   */
  mouseMoveImage (image, event) {
    if (this.readonly) {
      return;
    }
    let imageX = image.x;
    let imageY = image.y;
    this.canvas.onmousemove = ev => {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = 0;
      image.x = imageX + (ev.clientX - event.clientX) / this.mapWidth / this.scale;
      image.y = imageY + (ev.clientY - event.clientY) / this.mapHeight / this.scale;
      this.draw();
    };
  }

  /**
   * 画布背景拖拽事件
   * @param event
   */
  mouseMoveCanvas (event) {
    const canvasOffsetX = this.canvasOffsetX;
    const canvasOffsetY = this.canvasOffsetY;
    this.canvas.onmousemove = ev => {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = 0;
      this.canvasOffsetX = canvasOffsetX + ev.clientX - event.clientX;
      this.canvasOffsetY = canvasOffsetY + ev.clientY - event.clientY;
      this.draw();
    };
  }

  /**
   * canvas鼠标滚动，放大缩小
   * @param event
   */
  mouseWheel (event) {
    const wheelDelta = event.wheelDelta || event.deltalY * -40;
    const x = event.clientX - get(this.mapPosition, 'left');
    const y = event.clientY - get(this.mapPosition, 'top');
    const { left, top } = this.transformPoint(x, y, 1);
    if (wheelDelta > 0) {
      this.scale += 0.05;
      this.scale = this.scale > this.maxScale ? this.maxScale : this.scale;
    } else {
      this.scale -= 0.05;
      this.scale = this.scale < this.minScale ? this.minScale : this.scale;
    }
    this.canvasOffsetX = (1 - this.scale) * left + (x - left);
    this.canvasOffsetY = (1 - this.scale) * top + (y - top);
    this.draw();
  }

  /**
   * 初始化图像
   * @param params
   */
  initImages (params) {
    const bgImage = get(params, 'bgImage', '');

    if (bgImage) {
      this.setBgImage(bgImage);
    }
    this.setOptions(this.options).then(() => {
      this.draw();
    })
  }

  /**
   * 验证坐标是否在图像对象上
   * @param x
   * @param y
   * @returns {*}
   */
  getPointInImages (x, y) {
    let pointImage;
    for (let i = this.data.length - 1; i >= 0; i--) {
      const image = this.data[i];
      const { left, top } = this.transformPoint(
        image.x * this.mapWidth,
        image.y * this.mapHeight
      );
      const width = image.width * this.scale;
      const height = image.height * this.scale;
      if (x >= left && x < left + width  && y >= top && y < top + height) {
        pointImage = image;
        break;
      }
    }
    return pointImage;
  }

  /**
   * 画图
   * @param data
   */
  drawImage (data) {
    const { key, x, y, width, height } = data;
    const { image } = this.options.find(item => item.key === key);
    const { left, top } = this.transformPoint(x * this.mapWidth, y * this.mapHeight);

    this.context.drawImage(
      image,
      0, 0,
      image.width, image.height,
      left, top,
      (width || image.width) * this.scale,
      (height || image.height) * this.scale
    );
  }

  /**
   * 校对偏移量
   */
  verifyCanvasOffset () {
    if (this.canvasOffsetX < this.mapWidth * (1 - this.scale)) {
      this.canvasOffsetX = this.mapWidth * (1 - this.scale);
    } else if (this.canvasOffsetX > 0) {
      this.canvasOffsetX = 0
    }
    if (this.canvasOffsetY < this.mapHeight * (1 - this.scale)) {
      this.canvasOffsetY = this.mapHeight * (1 - this.scale);
    } else if (this.canvasOffsetY > 0) {
      this.canvasOffsetY = 0
    }
  }

  /**
   * 点坐标转换
   * @param x
   * @param y
   * @param type number 0 坐标转放大后坐标 1 放大后坐标转坐标
   * @returns {{top: number, left: number}}
   */
  transformPoint (x, y, type = 0) {
    if (type) {
      return {
        left: round((x - this.canvasOffsetX) / this.scale, 4),
        top: round((y - this.canvasOffsetY) / this.scale, 4)
      }
    } else {
      return {
        left: round(x * this.scale + this.canvasOffsetX, 4),
        top: round(y * this.scale + this.canvasOffsetY, 4)
      }
    }
  }

  /**
   * 重绘所有图像
   */
  draw () {
    this.verifyCanvasOffset();
    this.clear();
    if (!this.data) {
      return;
    }
    this.data.forEach(item => {
      this.drawImage(item);
    })
  }

  /**
   * 重置画布
   */
  clear () {
    this.context.clearRect(0, 0, this.mapWidth, this.mapHeight);
    this.drawBgImage();
  }

  /**
   * 绘制背景图
   */
  drawBgImage () {
    const { left, top } = this.transformPoint(0, 0);

    this.context.drawImage(
      this.bgImage,
      0, 0,
      this.bgImage.width, this.bgImage.height,
      left, top,
      this.mapWidth * this.scale, this.mapHeight * this.scale
    );
  }

  /**
   * 设置背景图
   * @param bgImage
   */
  setBgImage (bgImage) {
    const image = new Image();
    image.src = bgImage;
    this.bgImage = image;
    image.onload = () => {
      this.draw();
    };
  }

  /**
   * 设置选项列表，返回Promise，等待所有图片加载完成
   * @param options
   * @returns {Promise<any>}
   */
  setOptions (options = []) {
    let imgResolve;
    let loadCount = 0;
    this.options = [...options].map(item => {
      const image = new Image();
      image.src = item.url;
      image.onload = () => {
        loadCount++;
        if (loadCount === options.length) {
          imgResolve();
        }
      };
      item.image = image;
      return item;
    });

    return new Promise(resolve => {
      imgResolve = resolve;
    });
  }

  /**
   * 设置画布位点数据
   * @param data
   */
  setData (data) {
    this.data = data;
  }

  /**
   * 获取画布位点数据
   * @returns {*}
   */
  getData () {
    return this.data;
  }

  /**
   * 设置缩放率
   * @param scale
   */
  setScale (scale) {
    const x = this.mapWidth * 0.5;
    const y = this.mapHeight * 0.5;
    const { left, top } = this.transformPoint(x, y, 1);
    if (scale > this.maxScale) {
      this.scale = this.maxScale;
    } else if (scale < this.minScale) {
      this.scale = this.minScale;
    } else {
      this.scale = scale;
    }
    this.canvasOffsetX = (1 - this.scale) * left + (x - left);
    this.canvasOffsetY = (1 - this.scale) * top + (y - top);
    this.draw();
  }

  /**
   * 获取缩放率
   * @returns {number|*}
   */
  getScale () {
    return this.scale;
  }

  /**
   * 设置位点图像大小
   * @param width
   * @param height
   */
  setImageSize (width = 0, height = 0) {
    this.imageSize = {
      width,
      height: height || width
    }
  }

  /**
   * 重新获取目标元素并绑定事件
   */
  refresh () {
    this.initElements();
    this.initCanvas();
  }
}

export default Canvas;
