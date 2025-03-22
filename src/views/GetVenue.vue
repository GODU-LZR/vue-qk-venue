<template>
  <div>
    <el-container>
      <el-header><h2 style="text-align: center">查询场地</h2></el-header>
      <el-main><venueTable></venueTable></el-main>
      <el-footer></el-footer>
    </el-container>
  </div>
</template>

<script>
import venueTable from '../components/venueTable'
export default {
  name: "GetVenue",
  components: {
    venueTable: venueTable
  }
}
</script>

<style scoped>

</style>