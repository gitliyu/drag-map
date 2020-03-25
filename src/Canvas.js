import Base from './Base';
import { get, round, clone } from './utils';

class Canvas extends Base {

  constructor (params = {}) {
    super(params);
    this.options = get(params, 'options', []);
    this.data = get(params, 'data', []);
    this.maxScale = get(params, 'maxScale', 3);
    this.minScale = get(params, 'minScale', 1);
    this.scaleStep = get(params, 'scaleStep', 0.05);
    this.readonly = get(params, 'readonly', false);
    this.labelStyle = get(params, 'labelStyle', {});

    this.setImageSize();
    this.initElements();
    this.initCanvas();
    this.initImages(params);
  }

  /**
   * 初始化事件对象
   */
  initElements () {
    const map = this.document.querySelector(this.map);
    if (!map) {
      return console.warn('Object map not found:', this.map);
    }

    this.mapWidth = map.offsetWidth;
    this.mapHeight = map.offsetHeight;

    const list = this.document.querySelector(this.list);
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
      if (get(this.options, `${index}.disabled`)) {
        target.setAttribute('draggable', false);
        const imgs = target.querySelectorAll('img');
        imgs.forEach(img => img.setAttribute('draggable', false));
        return;
      }
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
    if (this.readonly || get(this.options, `${this.activeIndex}.disabled`)) {
      return;
    }
    let offsetX = event.x - get(this.mapPosition, 'left') - get(this.activeTarget, 'x');
    let offsetY = event.y - get(this.mapPosition, 'top') - get(this.activeTarget, 'y');
    const { left, top } = this.transformPoint(offsetX, offsetY, 1);
    const percentX = round(left / this.mapWidth, 4);
    const percentY = round(top / this.mapHeight, 4);

    const baseData = this.getOptionBaseData();
    const { image } = this.getActiveOption();
    const dropData = Object.assign(baseData, {
      x: percentX,
      y: percentY,
      width: this.imageSize.width || image.width,
      height: this.imageSize.height || image.height
    });
    this.data.push(dropData);
    this.drawImage(dropData);

    this.emit('drop', clone(dropData), event);
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
    const activeOption = this.options[this.activeIndex] || {};
    const { image } = activeOption;
    return Object.assign(clone(activeOption), { image });
  }

  /**
   * 初始化canvas
   */
  initCanvas () {
    this.canvas = this.document.querySelector(this.map);
    this.context = this.canvas.getContext('2d');

    this.canvas.width =  this.mapWidth;
    this.canvas.height =  this.mapHeight;

    this.scale = 1;
    this.canvasOffsetX = 0;
    this.canvasOffsetY = 0;
    this.bindCanvasEvent();
    this.initLabelStyle();
  }

  /**
   * 绑定canvas事件
   */
  bindCanvasEvent () {
    this.canvas.onmousedown = event => {
      if (this.mouseoverImage) {
        this.emit('mouseleave', clone(this.mouseoverImage), event);
        this.mouseoverImage = null;
      }
      const x = event.clientX - get(this.mapPosition, 'left');
      const y = event.clientY - get(this.mapPosition, 'top');

      const { image, type } = this.getPointTarget(x, y);
      switch (type) {
        case 'close': // 点击删除
          this.removeTarget(image);
          break;
        case 'image': // 点击图标
          this.mouseMoveImage(image, event);
          break;
        case 'map': // 点击画布
          this.mouseMoveCanvas(event);
          break;
        default:
          console.log('Error type');
      }

      this.clickTimeout = setTimeout(() => { this.clickTimeout = 0; }, 500);
      this.document.onmouseup = () => {
        this.canvas.onmousemove = e => {
          this.mouseMove(e);
        };
        this.document.onmouseup = null;
        clearTimeout(this.clickTimeout);
        if(this.clickTimeout && image){
          if (type === 'image') {
            this.emit('click', image);
          } else {
            this.emit('delete', image);
          }
        }
      }
    };

    this.canvas.onmousemove = event => {
      this.mouseMove(event);
    };

    this.canvas.onmousewheel = event => {
      this.mouseWheel(event);
      event.preventDefault();
    };

    this.canvas.onselectstart = event => {
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
      return this.mouseMoveCanvas(event);
    }
    let imageX = image.x;
    let imageY = image.y;
    this.canvas.onmousemove = ev => {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = 0;
      image.x = round(imageX + (ev.clientX - event.clientX) / this.mapWidth / this.scale, 4);
      image.y = round(imageY + (ev.clientY - event.clientY) / this.mapHeight / this.scale, 4);
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
   * canvas 鼠标移动
   * @param event
   */
  mouseMove (event) {
    const x = event.clientX - get(this.mapPosition, 'left');
    const y = event.clientY - get(this.mapPosition, 'top');
    const { image, type } = this.getPointTarget(x, y);

    if (type === 'image' || type === 'close') { // 鼠标移入图像
      this.mouseoverImage = image;
      this.emit('mouseover', image, event);
    } else if (type === 'map' && this.mouseoverImage) { // 鼠标移除
      this.emit('mouseleave', clone(this.mouseoverImage), event);
      this.mouseoverImage = null;
    }
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
      this.scale += this.scaleStep;
      this.scale = this.scale > this.maxScale ? this.maxScale : this.scale;
    } else {
      this.scale -= this.scaleStep;
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

    const deleteImage = get(params, 'deleteImage', require('./image/close.png'));
    this.deleteImageSize = get(params, 'deleteImageSize', 20);
    this.setDeleteImage(deleteImage);

    this.setOptions(this.options).then(() => {
      this.draw();
    })
  }

  /**
   * 获取坐标点所在对象
   * @param x
   * @param y
   * @returns {*}
   */
  getPointTarget (x, y) {
    let pointImage;
    let type = 'map';
    for (let i = this.data.length - 1; i >= 0; i--) {
      const image = this.data[i];
      const { left, top } = this.transformPoint(
        image.x * this.mapWidth,
        image.y * this.mapHeight
      );
      let { width, height } = this.getImageExactSize(image);
      const halfDeleteImageSize = this.deleteImageSize * this.scale / 2;
      if (x >= left + width - halfDeleteImageSize && x < left + width + halfDeleteImageSize
        && y >= top - halfDeleteImageSize && y < top + halfDeleteImageSize ) {
        pointImage = image;
        type = 'close';
        break;
      }
      if (x >= left && x < left + width  && y >= top && y < top + height) {
        pointImage = image;
        type = 'image';
        break;
      }
    }
    return {
      type,
      image: pointImage
    };
  }

  /**
   * 获取位点精确尺寸
   * @param data
   * @param isScale boolean true 带缩放 false 不带
   * @returns {{width: *, height: *}}
   */
  getImageExactSize(data, isScale = true) {
    let { width, height, key } = data;
    if (!width) {
      const { image } = this.options.find(item => item.key === key);
      width = this.imageSize.width || image.width;
      height = this.imageSize.height || image.height;
    }
    if (isScale) {
      width = width * this.scale;
      height = height * this.scale;
    }
    return {
      width,
      height: height || width
    };
  }

  /**
   * 删除位点
   * @param image
   */
  removeTarget (image) {
    if (this.readonly) {
      return;
    }
    const index = this.data.findIndex(item => {
      return item.key === image.key && item.x === image.x
        && item.y === image.y && item.width === image.width;
    });
    this.data.splice(index, 1);
    this.draw();
  }

  /**
   * 初始化label样式
   */
  initLabelStyle () {
    if (this.labelStyle.font) {
      this.context.font = this.labelStyle.font;
    }
    if (this.labelStyle.fillStyle) {
      this.context.fillStyle = this.labelStyle.fillStyle;
    }
    this.labelStyle.position = this.labelStyle.position || 'bottom';
    switch (this.labelStyle.position) {
      case 'top':
        this.context.textAlign = 'center';
        this.context.textBaseline = 'bottom';
        break;
      case 'bottom':
        this.context.textAlign = 'center';
        this.context.textBaseline = 'top';
        break;
      case 'left':
        this.context.textAlign = 'right';
        this.context.textBaseline = 'middle';
        break;
      case 'right':
        this.context.textAlign = 'left';
        this.context.textBaseline = 'middle';
        break;
    }
  }

  /**
   * 画图
   * @param data
   */
  drawImage (data) {
    const { key, x, y } = data;
    const { image } = this.options.find(item => item.key === key);
    const { left, top } = this.transformPoint(x * this.mapWidth, y * this.mapHeight);
    const { width, height } = this.getImageExactSize(data, false);

    // 绘制位点
    this.context.drawImage(
      image,
      0, 0,
      image.width, image.height,
      left, top,
      width * this.scale,
      height * this.scale
    );

    // 绘制标签
    if (data.label) {
      this.drawLabel({
        label: data.label,
        x: x * this.mapWidth,
        y: y * this.mapHeight,
        width,
        height
      });
    }

    // 绘制删除按钮
    if (this.deleteImage && !this.readonly) {
      const btnLeft = x * this.mapWidth + width - this.deleteImageSize / 2;
      const btnTop = y * this.mapHeight - this.deleteImageSize / 2;
      const btnPosition = this.transformPoint(btnLeft, btnTop);
      this.context.drawImage(
        this.deleteImage,
        0, 0,
        this.deleteImage.width, this.deleteImage.height,
        btnPosition.left, btnPosition.top,
        this.deleteImageSize * this.scale, this.deleteImageSize * this.scale
      );
    }
  }

  /**
   * 绘制位点label
   * @param data
   */
  drawLabel (data) {
    const { label, x, y, imageWidth, imageHeight } = data;
    const margin = this.labelStyle.margin || 15;
    let labelLeft = 0, labelTop = 0;
    switch (this.labelStyle.position) {
      case 'top':
        labelLeft = x + imageWidth / 2;
        labelTop = y - margin;
        break;
      case 'bottom':
        labelLeft = x + imageWidth / 2;
        labelTop = y + imageHeight + margin;
        break;
      case 'left':
        labelLeft = x - margin;
        labelTop = y + imageHeight / 2;
        break;
      case 'right':
        labelLeft = x + imageWidth + margin;
        labelTop = y + imageHeight / 2;
        break;
    }
    const { left, top } = this.transformPoint(labelLeft, labelTop);
    this.context.fillText(label, left, top);
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
    this.clearMap();
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
  clearMap () {
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
   * 设置删除按钮
   * @param deleteImage
   */
  setDeleteImage (deleteImage) {
    const image = new Image();
    image.src = deleteImage;
    image.onload = () => {
      this.deleteImage = image;
      this.draw();
    };
  }

  /**
   * 设置删除按钮尺寸
   * @param size
   */
  setDeleteImageSize (size = 20) {
    this.deleteImageSize = size;
    this.draw();
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
    this.draw();
  }

  /**
   * 获取画布位点数据
   * @returns {*}
   */
  getData () {
    return this.data.map(item => {
      const result = clone(item);
      delete result.image;
      delete result.url;

      return result;
    });
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
   * 设置位点图像大小
   * @param width
   * @param height
   */
  setImageSize (width = 0, height = 0) {
    this.imageSize = {
      width: +width,
      height: +height || +width
    }
  }

  /**
   * 设置只读
   * @param readonly
   */
  setReadonly (readonly = false) {
    this.readonly = readonly;
    this.draw();
  }

  /**
   * 设置每次缩放比例
   * @param step
   */
  setScaleStep (step = 0.05) {
    this.scaleStep = step;
  }

  /**
   * 设置最小缩放率
   * @param scale
   */
  setMinScale (scale = 1) {
    this.minScale = scale;
  }

  /**
   * 设置最大缩放率
   * @param scale
   */
  setMaxScale (scale = 3) {
    this.maxScale = scale;
  }

  /**
   * 设置选项禁用
   * @param index
   * @param disabled
   */
  setOptionDisabled (index, disabled = true) {
    this.options[index].disabled = disabled;
    this.initElements();
  }

  /**
   * 设置位点label样式
   * @param style
   */
  setLabelStyle (style = {}) {
    this.labelStyle = style;
    this.initLabelStyle();
    this.draw();
  }

  /**
   * 清空数据并重置画布
   */
  clear () {
    this.data = [];
    this.draw();
  }

  /**
   * 重新获取目标元素并绑定事件
   */
  refresh () {
    this.initElements();
  }
}

export default Canvas;
