<template>
  <div class="position">
    <div id="drag-list">
      <div class="drag-target" v-for="(item, index) in selectList" :key="index">
        <svg class="icon svg-icon" aria-hidden="true">
          <use :xlink:href="'#icon-house-' + item.number"></use>
        </svg>
      </div>
    </div>

    <div id="drag-map">
      <div class="drag-target" :style="item.style" v-for="(item, index) in mapList" :key="index">
        <svg class="icon svg-icon" aria-hidden="true">
          <use :xlink:href="'#icon-house-' + item.number"></use>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import DragMap from 'drag-map';

export default {
  components: {},
  data () {
    return {
      selectList: [
        { number: 0 },
        { number: 1 },
        { number: 2 },
        { number: 3 },
        { number: 4 }
      ],
      mapList: [],
      dragMap: null
    };
  },
  mounted () {
    this.initDragMap();
  },
  methods: {
    initDragMap () {
      this.dragMap = new DragMap();

      this.dragMap.on('drop', this.onDrop);
      this.dragMap.on('dragleave', this.onDropLeave)
    },
    onDrop (data) {
      const index = data.index;
      if (data.action === 'add') {  // add
        /*
        * 获取索引值对应数据，并进行深拷贝
        * 设置style属性
        * 使用$set设置响应式属性，放入数组
        * */
        const target = {...this.selectList[index]};
        target.style = data.percentStyle;
        this.$set(this.mapList, this.mapList.length, target);
      } else {  // edit
        this.mapList[index]['style'] = data.percentStyle;
      }
      // 渲染完成后，重新获取dom节点
      this.$nextTick(() => {
        this.dragMap.refresh();
      })
    },
    onDropLeave (data) {
      // remove
      this.mapList.splice(data.index, 1);
      this.$nextTick(() => {
        this.dragMap.refresh();
      })
    }
  }
}
</script>

<style lang="scss">
  .position {
    width: 80%;
    height: 600px;
    margin: 20px auto;
    padding: 10px;
    border: 1px solid #333;

    #drag-list {
      display: flex;
    }

    .drag-target{
      width: 100px;
      height: 100px;
      margin-right: 10px;
      text-align: center;
      line-height: 100px;
      .icon {
        width: 70px;
        height: 70px;
        vertical-align: middle;
        fill: currentColor;
        overflow: hidden;
      }
    }

    #drag-map {
      height: calc(100% - 110px);
      margin-top: 10px;
      border: 1px solid #666;
      position: relative;
      .drag-target {
        position: absolute;
      }
    }
  }
</style>
