<template>
  <div>
    <el-container>
      <el-header><h2 style="text-align: center">体育馆地图</h2></el-header>
      <div style="padding: 0 20px">
        <el-row>
          <el-col :span="21">
            <el-input v-model="key" placeholder="请输入搜索关键字"></el-input>
          </el-col>
          <el-col :span="3" style="display: flex; align-items: center; justify-content: flex-end;">
            <el-button type="primary" @click="getNearData">查询</el-button>
            <el-button type="success">跳转</el-button>
          </el-col>
        </el-row>
      </div>

      <el-main><venueMap></venueMap></el-main>
    </el-container>
  </div>
</template>

<script>
import {mapMutations} from 'vuex'
import {getNearData} from "@/api/map/getNearData";
import venueMap from '../components/venueMap'
export default {
  name: "VenueMap",
  components: {
    venueMap: venueMap
  },
  data() {
    return{
      key: ''
    }
  },
  methods: {
    ...mapMutations(['updatePosition']),
   async getNearData() {
      try{
        const response = await getNearData(this.key, '21.151325, 110.300695');
        const data = response.data.map(item => item.location);

        const newData = data.map(coordString => {
          // 检查数组元素是否是字符串
          if (typeof coordString !== 'string') {
            console.warn(`跳过非字符串元素: ${coordString}`);
            return coordString; // 返回原始元素，或者可以返回 null/undefined
          }

          // 使用逗号分割字符串，并去除每个部分的空白字符
          const parts = coordString.split(',').map(part => part.trim());

          // 检查是否成功分割出两个部分（纬度和经度）
          if (parts.length === 2) {
            const latitude = parts[0];  // 第一个部分是纬度
            const longitude = parts[1]; // 第二个部分是经度

            // 组合成新的字符串，格式为 "经度, 纬度"
            return `${longitude}, ${latitude}`;
            // 或者使用字符串拼接：return longitude + ', ' + latitude;
          } else {
            // 如果格式不正确，打印警告并返回原始字符串
            console.warn(`坐标格式无效: "${coordString}"。期望格式为 "纬度, 经度"。`);
            return coordString; // 返回原始字符串，表示未能转换
          }
        });

        this.updatePosition(newData);
      }catch (error) {
        console.error("错误:" + error);
        this.$message.error("查询失败");
      }
   }
  }
}
</script>

<style scoped>

</style>