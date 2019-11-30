<template>
  <div class="canvas">
    <div id="drag-list">
      <div class="drag-target" v-for="(item, index) in selectList" :key="index">
        <img :src="item.img">
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
      return { img: require(`../assets/image/icon-house-${item}.png`) };
    });
  },
  mounted () {
    this.initDragMap();
  },
  methods: {
    initDragMap () {
      this.dragMap = new DragMap({ type: 'canvas' });
    }
  }
}
</script>

<style lang="scss">
  .canvas {
    width: 80%;
    height: 500px;
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
