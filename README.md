# drag-map

拖拽定位工具类，主要应用场景为各种IOT项目的示意图，设备定位功能

目前分为两种模式

- 定位：绝对定位版本，比较简易，主要提供了拖拽方法，事件发送和位点绝对定位数据的转换，不包含对dom结构和数据的管理
- Canvas：地图由`Canvas`绘制，支持拖拽和缩放，相比定位版，使用起来更加方便


### Demo
Demo: ['https://www.liyu.fun/demo/drag-map'](https://www.liyu.fun/demo/drag-map)

Demo源码示例： ['定位'](https://github.com/gitliyu/drag-map/blob/master/demo/src/views/Position.vue) ['Canvas'](https://github.com/gitliyu/drag-map/blob/master/demo/src/views/Canvas.vue)

### 安装
```
npm install drag-map
```

### 使用
```javascript
import DragMap from 'DragMap'

const dragMap = new DragMap();
```
在实例化时可接受参数，不传时以下为默认值
```javascript
new DragMap({
  document: document, // 文档对象注入
  list: '#drag-list',   // 可选目标列表
  map: '#drag-map',     // 拖拽目标区域
  target: '.drag-target'  // 拖拽目标
})
```
Canvas版本可接受更多参数
```javascript
new DragMap({
  ...{ baseParams },
  type: 'canvas', // 使用canvas版本时必须设置
  options: {},  // 可选区域的数据列表
  bgImage: 'bg.png',  // 背景图片地址
  maxScale: 3,  // 最大放大倍数，默认为3
  minScale: 1,  // 最小缩放倍数，默认为1
  scaleStep: 0.05, // 鼠标滑轮每次缩放比例, 默认为0.05
  readonly: false,  // 只读模式
  deleteImage: 'close.png', // 删除按钮图片地址
  deleteImageSize: 20, // 删除按钮尺寸，默认为20px
  data: []  // 初始化的数据
})
```
> `options`和`data`具体的数据结构可以查看demo

默认html结构为
```html
<div id="drag-list">
  <div class="drag-target">1</div>
  <div class="drag-target">2</div>
  <div class="drag-target">3</div>
</div>

<!-- 定位 -->
<div id="drag-map"></div>
<!-- Canvas -->
<canvas id="drag-map"></canvas>
```

### 事件
对于拖拽各个过程的数据，都会以事件的形式发送出来，监听方式如下
```javascript
const dragMap = new DragMap();

dragMap.on('drop', data => {
  console.log('drop', data);
});
dragMap.on('dragleave', data => {
  console.log('leave', data);
})
```
以下是所有事件介绍

- ***dragstart*** 拖拽开始
- ***dragenter*** 进入目标区域
- ***dragover*** 在目标区域中拖拽
- ***drop*** 拖拽完成
- ***dragleave*** 拖拽离开目标区域

Canvas版本有更多事件

- ***click*** 点击位点图像
- ***delete*** 点击删除按钮

事件回调参数有两个，第一个参数格式如下，第二个参数为原生`drag`事件参数
```javascript
// 定位
{
  action: 'add'   // 操作类型 'add'|'edit'
  index: 1  // 拖拽对象索引值
  offsetX: 155  // 水平偏移量，单位px
  offsetY: 106  // 垂直偏移量，单位px
  percentX: 10.18   // 水平偏移百分比
  percentY: 27.04   // 垂直偏移百分比
  style: 'left: 155px;top: 106px;', // style字符串
  percentStyle: 'left: 10.18%;top: 27.04%;' // 百分比style字符串
}
// canvas
{
  ...{ optionData },  // options原本的data
  x: 0.2, // 横坐标 保留4位
  y: 0.3, // 纵坐标
  width: 70,  // 位点图像宽度
  height: 70  // 位点图像高度
}
```

### 方法
- ***refresh()*** 当dom元素发生变化后调用，重新刷新dom节点并绑定事件

以下方法只有`Canvas`版本可用
- ***draw()*** 重绘画布
- ***setBgImage(url)*** 设置背景图
- ***setOptions(options)*** 设置可选项数据，返回`Promise`，设置后需要等待图片加载完成再进行下一步
```javascript
dragMap.setOptions(options).then(() => {
  // do something
})
```
- ***setData(data)*** 设置位点数据
- ***getData()*** 获取位点数据
- ***setScale(scale)*** 设置当前缩放倍数
- ***setScaleStep(step)*** 设置每次缩放比例，默认`0.05`
- ***setImageSize(width, height)*** 设置位点图片大小，默认为图片本身大小,`height`不传时默认和`width`相同
```javascript
dragMap.setImageSize(70)
```
- ***clear()*** 清空数据并重置画布，保留背景图
- ***setDeleteImage(url)*** 设置删除按钮图片
- ***setDeleteImageSize(size)*** 设置删除按钮尺寸
