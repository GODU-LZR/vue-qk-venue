<template>
  <div>
    <el-container>
      <el-header><h2 style="text-align: center">体育馆地图</h2></el-header>
      <el-main><venueMap></venueMap></el-main>
    </el-container>
  </div>
</template>

<script>
import venueMap from '../components/venueMap'
export default {
  name: "VenueMap",
  components: {
    venueMap: venueMap
  }
}
</script>

<style scoped>

</style>