<template>
  <div id="app">
    <div class="nav">
      <router-link to="/position">定位</router-link>
      <router-link to="/canvas">Canvas</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class App extends Vue {}
</script>

<style lang="scss">
  .nav {
    text-align: center;
    margin-top: 50px;
    a {
      color: #666;
      font-size: 25px;
      padding: 10px 30px;
      text-decoration: none;
      &.router-link-active {
        color: green;
      }
    }
  }
</style>
