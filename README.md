# drag-map

拖拽定位工具类，主要提供了拖拽方法的封装，事件发送以及位点数据的计算

### Demo
Demo: ['https://www.liyu.fun/demo/drag-map'](https://www.liyu.fun/demo/drag-map)

Demo源码示例： ['Home.vue'](https://github.com/gitliyu/drag-map/blob/master/demo/src/views/Home.vue)

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
  list: '#drag-list',   // 可选目标列表
  map: '#drag-map',     // 拖拽目标区域
  target: '.drag-target'  // 拖拽目标
})
```
默认html结构为
```html
<div id="drag-list">
  <div class="drag-target">1</div>
  <div class="drag-target">2</div>
  <div class="drag-target">3</div>
</div>

<div id="drag-map"></div>
```

### 事件
对于拖拽各个过程的数据，都会以事件的形式发送出来，监听方式如下
```javascript
const dragMap = new DragMap();

dragMap.on('drop', data => {
  console.log('drop', data);
}).on('dragleave', data => {
  console.log('leave', data);
})
```
以下是所有事件介绍

- ***dragstart*** 拖拽开始
- ***dragenter*** 进入目标区域
- ***dragover*** 在目标区域中拖拽
- ***drop*** 拖拽完成
- ***dragleave*** 拖拽离开目标区域

事件回调参数有两个，第一个参数格式如下，第二个参数为原生`drag`事件参数
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
***refresh()*** 当dom元素发生变化后调用，重新刷新dom节点并绑定事件
