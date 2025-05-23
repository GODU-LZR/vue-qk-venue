<!-- vue-qk-venue/src/App.vue -->
<template>
  <div>
    <div class="line"></div>
    <el-menu
        :default-active="activeMenuIndex"
        class="el-menu-demo"
        mode="horizontal"
        @select="handleSelect"
        router>
      <el-menu-item index="/venue">查询场地</el-menu-item>
      <el-menu-item index="/order">场地订单</el-menu-item>
      <el-menu-item index="/VenueMap">体育馆地图</el-menu-item>

      <el-submenu index="admin">
        <template slot="title">管理员平台</template>
        <el-menu-item index="/admin/venue">场地管理</el-menu-item>
        <el-menu-item index="/admin/audit">审核平台</el-menu-item>
      </el-submenu>
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
  },
  computed: {
    // 计算当前应该激活的菜单项的 index
    activeMenuIndex() {
      const currentPath = this.$route.path;
      const menuIndices = [
        '/venue',
        '/order',
        '/VenueMap',
        '/admin/venue',
        '/admin/audit',
        // 添加所有其他可能的菜单 index
      ];

      let bestMatchIndex = '';
      for (const index of menuIndices) {
        if (index && currentPath.startsWith(index)) {
          // 如果找到一个更长的匹配，或者这是第一个匹配
          if (index.length > bestMatchIndex.length) {
            bestMatchIndex = index;
          }
        }
      }
      return bestMatchIndex;
    }
  },
}
</script>