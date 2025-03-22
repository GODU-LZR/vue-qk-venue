// src/router/index.js
import Vue from 'vue'
import Router from 'vue-router'
import Home from '../views/Home.vue' // 示例
import GetVenue from '../views/GetVenue'
import MyVenue from '../views/MyVenue'
import VenueMap from '../views/VenueMap'

Vue.use(Router)

const routes = [
  { path: '/', name: 'GetVenue', component: GetVenue},
  { path: '/GetVenue', name: 'GetVenue', component: GetVenue},
  { path: '/MyVenue', name: 'MyVenue', component: MyVenue},
  { path: '/VenueMap', name: 'VenueMap', component: VenueMap}
]

const router = new Router({
  mode: 'history',
  // 若在 qiankun 环境下，设置 base 为 /user
  base: window.__POWERED_BY_QIANKUN__ ? '/venue' : '/',
  routes
})

export default router
