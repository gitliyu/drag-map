<template>
  <div class="canvas-page">
    <div id="drag-list">
      <div class="drag-target" v-for="(item, index) in selectList" :key="index">
        <img :src="item.url">
      </div>
      <div class="modal" v-if="params.readonly"></div>
    </div>

    <canvas id="drag-map"></canvas>

    <div class="action-bar">
      <h3>背景图</h3>
      <el-select v-model="params.bgImage" @change="onChangeBg">
        <el-option
          v-for="item in bgOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>

      <h3>放大率</h3>
      <el-input-number v-model="params.scale" @change="onChangeScale" :min="1" :max="3" :step="0.1"></el-input-number>

      <h3>位点尺寸</h3>
      <el-input type="number" v-model="params.size" @change="onChangeSize">
        <template slot="append">px</template>
      </el-input>

      <h3>设置位点</h3>
      <el-button @click="onCreateTargets">点击随机生成</el-button>

      <h3>只读模式</h3>
      <el-switch v-model="params.readonly" @change="onChangeReadonly"></el-switch>
    </div>
  </div>
</template>

<script>
import DragMap from 'drag-map';

export default {
  components: {},
  data () {
    return {
      selectList: [0, 1, 2, 3, 4],
      mapList: [],
      dragMap: null,
      bgOptions: [],
      params: {
        bgImage: 0,
        scale: 1,
        size: 70,
        readonly: false
      }
    };
  },
  created () {
    this.selectList = this.selectList.map(item => {
      return {
        key: item,  // key值必须设置，作为唯一标识符
        url: require(`../assets/image/icon-house-${item}.png`)
      };
    });
  },
  mounted () {
    this.getBgOptions();
    this.initDragMap();
  },
  methods: {
    initDragMap () {
      this.dragMap = new DragMap({
        type: 'canvas',
        options: this.selectList,
        bgImage: require('../assets/image/bg0.jpg')
      });

      this.dragMap.on('drop', data => {
        this.$message.success(`成功添加位点信息 key: ${data.key}, x: ${data.x}, y: ${data.y}, width: ${data.width}, y: ${data.y}`)
      });

      this.dragMap.on('click', data => {
        this.$message.success(`当前点击位点信息 key: ${data.key}, x: ${data.x}, y: ${data.y}`);
      })
    },
    getBgOptions () {
      this.bgOptions = [0, 1, 2, 3].map(value => {
        return {
          label: `背景图${value + 1}`,
          value
        };
      })
    },
    onChangeBg (val) {
      this.dragMap.setBgImage(require(`../assets/image/bg${val}.jpg`));
    },
    onChangeScale (val) {
      this.dragMap.setScale(val);
    },
    onChangeSize (val) {
      this.dragMap.setImageSize(val);
    },
    onCreateTargets () {
      const data = [];
      for (let i = 0; i < 5; i++) {
        const size = 50 * (Math.random() + 1);
        data.push({
          key: Math.floor(Math.random() * 5),
          x: (Math.random()).toFixed(4),
          y: (Math.random()).toFixed(4),
          width: size,
          height: size
        })
      }
      this.dragMap.setData(data);
    },
    onChangeReadonly (val) {
      this.dragMap.setReadonly(val);
    }
  }
}
</script>

<style lang="scss">
  .canvas-page {
    width: 70%;
    height: 600px;
    margin-top: 20px;
    margin-left: 20%;
    padding: 10px;
    border: 1px solid #333;
    position: relative;

    #drag-list {
      display: flex;
      position: relative;
      .modal {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background: rgba(0,0,0,.1);
      }
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

    .action-bar {
      position: absolute;
      left: -25%;
      top: 10px;
      width: 20%;
    }
  }
</style>
