import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    nearPosition: ['110.300695, 21.151325', '111.300695, 22.151325'],
    userLocation: '21.151325, 110.300695' // 新增：用于存储用户当前位置，例如格式为 [经度, 纬度]
  },
  getters: {

  },
  mutations: {
    updatePosition(state, n) {
      state.nearPosition = n;
    },
    updateLocation(state, n) { // 新增：设置用户位置的 mutation
      state.userLocation = n; // location 预期是一个 [经度, 纬度] 数组或 null
    }
  },
  actions: {
  },
  modules: {
  }
})
