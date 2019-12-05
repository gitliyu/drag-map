<template>
  <div class="canvas">
    <div id="drag-list">
      <div class="drag-target" v-for="(item, index) in selectList" :key="index">
        <img :src="item.url">
      </div>
    </div>

    <canvas id="drag-map"></canvas>
  </div>
</template>

<script>
import DragMap from '../assets/js/DragMap';

export default {
  components: {},
  data () {
    return {
      selectList: [0, 1, 2, 3, 4],
      mapList: [],
      dragMap: null
    };
  },
  created () {
    this.selectList = this.selectList.map(item => {
      return { url: require(`../assets/image/icon-house-${item}.png`) };
    });
  },
  mounted () {
    this.initDragMap();
  },
  methods: {
    initDragMap () {
      this.dragMap = new DragMap({
        type: 'canvas',
        images: this.selectList,
        bgImage: require('../assets/image/bg.png')
      });
      /*this.dragMap.setData([{
        index: 1,
        x: 0.2,
        y: 0.3,
        width: 70,
        height: 70
      }]);
      this.dragMap.draw();*/
    }
  }
}
</script>

<style lang="scss">
  .canvas {
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
      img {
        width: 70px;
        vertical-align: middle;
      }
    }

    #drag-map {
      width: 100%;
      height: calc(100% - 110px);
      margin-top: 10px;
      border: 1px solid #666;
    }
  }
</style>
