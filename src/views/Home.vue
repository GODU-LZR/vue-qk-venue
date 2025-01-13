<!-- vue-qk-venue/src/views/Home.vue -->
<template>
  <div>
    <h2>体育场地模块首页</h2>
    <el-button type="primary" @click="showMessage">点击测试</el-button>
  </div>
</template>

<script>
export default {
  name: 'VenueHome',
  methods: {
    showMessage() {
      this.$message('体育场地子应用的 ElementUI 按钮点击了！');
    }
  }
}
</script>