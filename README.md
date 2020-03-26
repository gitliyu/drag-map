# drag-map

拖拽定位工具类，主要应用场景为各种IOT项目的示意图，设备定位功能

目前分为两种模式

- Canvas：地图由`Canvas`绘制，支持拖拽和缩放，包含位点数据的管理和一系列配置方法，相比定位版，使用起来更加方便，功能更加齐全，推荐使用
- 定位：绝对定位版本，比较简易，主要提供了拖拽方法，事件发送和位点绝对定位数据的转换，不包含对dom结构和数据的管理，作者已放弃治疗，请慎用

### Demo
Demo: ['https://www.liyu.fun/demo/drag-map'](https://www.liyu.fun/demo/drag-map)

Demo源码示例： ['Canvas'](https://github.com/gitliyu/drag-map/blob/master/demo/src/views/Canvas.vue)  ['定位'](https://github.com/gitliyu/drag-map/blob/master/demo/src/views/Position.vue)

### 安装
```
npm install drag-map
```

### 使用
```javascript
import DragMap from 'drag-map'

const dragMap = new DragMap();
```
### Canvas版本
默认html结构如下，可在配置项中修改
```html
<div id="drag-list">
  <div class="drag-target">1</div>
  <div class="drag-target">2</div>
  <div class="drag-target">3</div>
</div>

<canvas id="drag-map"></canvas>
```
#### 配置项
在实例化时可接受参数，除`type`和`options`外均为非必填项，以下为默认值
```javascript
new DragMap({
  document, // 文档对象注入
  type: 'canvas', // 使用canvas版本时必须设置
  list: '#drag-list',   // 可选目标列表
  map: '#drag-map',     // 拖拽目标区域
  target: '.drag-target',  // 拖拽目标
  options: {},  // 可选区域的数据列表
  data: [],  // 初始化的数据
  bgImage: 'bg.png',  // 背景图片地址
  maxScale: 3,  // 最大放大倍数，默认为3
  minScale: 1,  // 最小缩放倍数，默认为1
  scaleStep: 0.05, // 鼠标滑轮每次缩放比例, 默认为0.05
  readonly: false,  // 只读模式
  deleteImage: 'close.png', // 删除按钮图片地址
  deleteImageSize: 20, // 删除按钮尺寸，默认为20px
  labelStyle: {}  // 位点标签样式
})
```
其中`options`为拖拽位点图片数据，格式如下
```javascript
{
  key: 1, // key值必须设置，作为唯一标识符，与drag-list索引值对应
  url: 'xxx.png', // 位点图片地址
  label: 'label', // 位点标签
  disabled: false, // 选项禁用
  ...options // 其他自定义数据，会在事件和记录的位点数据中一并记录
}
```
位点数据`data`格式如下
```javascript
[{
  key: 1,
  x: 0.2, // 横坐标 保留4位
  y: 0.3, // 纵坐标
  width: 70,  // 位点图像宽度
  height: 70,  // 位点图像高度
  ...options // options中自定义数据
}]
```
位点标签样式`labelStyle`格式如下
```javascript
{
  font: '16px bold 黑体', // 字体样式字符串
  fillStyle: '#333',  // 字体颜色
  margin: 15, // label间距，默认15
  position: 'bottom'  // label位置，默认bottom top|bottom|left|right
}
```

#### 事件
对于拖拽各个过程的数据，都会以事件的形式发送出来，监听方式如下
```javascript
const dragMap = new DragMap();

dragMap.on('drop', (data, event) => {
  console.log('drop', data, event);
});
dragMap.on('click', data => {
  console.log('click', data);
})
```
以下是所有事件介绍

- ***dragstart(data, event)*** 拖拽开始
- ***dragenter(data, event)*** 进入目标区域
- ***dragover(data, event)*** 在目标区域中拖拽
- ***drop(data, event)*** 拖拽完成
- ***dragleave(data, event)*** 拖拽离开目标区域
- ***click(data, event)*** 点击位点图像
- ***delete(data)*** 点击位点删除按钮
- ***mouseover(data, event)*** 鼠标经过位点
- ***mouseleave(data, event)*** 鼠标移出位点

事件接受参数`event`为原生事件参数，`data`为当前位点数据格式同实力化格式一致

#### 方法
操作类
- ***refresh()*** 当dom元素发生变化后调用，重新刷新dom节点并绑定事件
- ***draw()*** 重绘画布
- ***clear()*** 清空数据并重置画布，保留背景图

数据类
- ***setOptions(options)*** 设置可选项数据，返回`Promise`，设置后需要等待图片加载完成再进行下一步
```javascript
dragMap.setOptions(options).then(() => {
  // do something
})
```
- ***setData(data)*** 设置位点数据
- ***getData()*** 获取位点数据

配置类
- ***setBgImage(url)*** 设置背景图
- ***setScale(scale)*** 设置当前缩放倍数
- ***setMinScale(scale)*** 设置最小缩放倍数，默认`1`
- ***setMaxScale(scale)*** 设置最大缩放倍数，默认`3`
- ***setScaleStep(step)*** 设置每次缩放比例，默认`0.05`
- ***setImageSize(width, height)*** 设置位点图片大小，默认为图片本身大小,`height`不传时默认和`width`相同
```javascript
dragMap.setImageSize(70)
dragMap.setImageSize(50, 60)
```
- ***setDeleteImage(url)*** 设置删除按钮图片
- ***setDeleteImageSize(size)*** 设置删除按钮尺寸
- ***setOptionDisabled(index, disabled)*** 设置选项禁用
```javascript
dragMap.setOptionDisabled(1) // 索引为1的禁用
dragMap.setOptionDisabled(2, false) // 取消禁用
```
- ***setLabelStyle(style)*** 设置label样式
```javascript
dragMap.setLabelStyle({
  font: '16px bold 黑体',
  fillStyle: '#333',
  margin: 15,
  position: 'bottom'
})
```


### 定位版本
默认html结构为
```html
<div id="drag-list">
  <div class="drag-target">1</div>
  <div class="drag-target">2</div>
  <div class="drag-target">3</div>
</div>

<div id="drag-map"></div>
```
#### 配置项
在实例化时可接受参数，以下为默认值
```javascript
new DragMap({
  document, // 文档对象注入
  list: '#drag-list',   // 可选目标列表
  map: '#drag-map',     // 拖拽目标区域
  target: '.drag-target'  // 拖拽目标
})
```
#### 事件
- ***dragstart(data, event)*** 拖拽开始
- ***dragenter(data, event)*** 进入目标区域
- ***dragover(data, event)*** 在目标区域中拖拽
- ***drop(data, event)*** 拖拽完成
- ***dragleave(data, event)*** 拖拽离开目标区域

> 移动端只支持drop事件

相比于`canvas`版本，`data`数据格式有所不同
```javascript
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
```
### 方法
- ***refresh()*** 当dom元素发生变化后调用，重新刷新dom节点并绑定事件
