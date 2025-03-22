<template>
  <div>
    <el-container>
      <el-header><h2 style="text-align: center">我的场地</h2></el-header>
      <el-main><myVenueUL></myVenueUL></el-main>
    </el-container>
  </div>
</template>

<script>
import myVenueUL from '../components/myVenueUL'
export default {
  name: "MyVenue",
  components: {
    myVenueUL: myVenueUL
  }
}
</script>

<style scoped>

</style>