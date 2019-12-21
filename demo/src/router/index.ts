import Vue from 'vue'
import VueRouter from 'vue-router'
import Position from '../views/Position.vue'
import Canvas from '../views/Canvas.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/canvas'
  },
  {
    path: '/position',
    name: 'position',
    component: Position
  },
  {
    path: '/canvas',
    name: 'canvas',
    component: Canvas
  }
]

const router = new VueRouter({
  routes
})

export default router
