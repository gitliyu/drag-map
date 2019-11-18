<template>
  <div class="home">
    <div id="drag-list">
      <div class="drag-target" v-for="(item, index) in selectList" :key="index">
        {{ item.text }}
      </div>
    </div>

    <div id="drag-map">
      <div class="drag-target" :style="item.style" v-for="(item, index) in mapList" :key="index">
        {{ item.text }}
      </div>
    </div>
  </div>
</template>

<script>
import DragMap from 'drag-map';

export default {
  name: 'home',
  components: {},
  data () {
    return {
      selectList: [
        { text: 1 },
        { text: 2 },
        { text: 3 }
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
        const target = {...this.mapList[index]};
        target.style = data.percentStyle;
        this.$set(this.mapList, index, target);
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
  .home {
    width: 80%;
    height: 500px;
    margin: 50px auto;
    padding: 10px;
    border: 1px solid #333;

    #drag-list {
      display: flex;
    }

    .drag-target{
      width: 100px;
      height: 100px;
      border: 1px solid #666;
      margin-right: 10px;
      text-align: center;
      line-height: 100px;
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
