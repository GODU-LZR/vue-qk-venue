<!-- vue-qk-venue/src/App.vue -->
<template>
  <div>
    <div class="line"></div>
    <el-menu
        default-active="/GetVenue"
        class="el-menu-demo"
        mode="horizontal"
        @select="handleSelect"
        router>
      <el-menu-item index="/GetVenue">查询场地</el-menu-item>
      <el-menu-item index="/MyVenue">我的场地</el-menu-item>
      <el-menu-item index="/VenueMap">体育馆地图</el-menu-item>
      <el-menu-item index="/AuditVenue" v-if="user === '赛事管理员' || user === '超级管理员'">审核平台</el-menu-item>
    </el-menu>

    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'VenueApp',
  data() {
    return {
      user: '超级管理员'
    };
  },
  methods: {
    handleSelect(key, keyPath) {
    }
  },
  mounted() {
    console.log("当前路由路径：", this.$route.path);
  }
}
</script>