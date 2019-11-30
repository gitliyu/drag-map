import Base from './Base';

class Canvas extends Base {

  constructor (options = {}) {
    super(options);

    this.initCanvas();
  }

  initCanvas () {
    this.canvas = document.querySelector(this.map);
    this.context = this.canvas.getContext('2d');

    this.canvas.width =  this.canvas.offsetWidth;
    this.canvas.height =  this.canvas.offsetHeight;

    this.scale = 1;
    this.drawImage();
  }

  drawImage () {
    const img = document.querySelectorAll('img')[0];
    this.context.drawImage(
      img,
      0, 0,
      img.width, img.height,
      0, 0,
      img.width * this.scale, img.height * this.scale
    );
  }

}

export default Canvas;
