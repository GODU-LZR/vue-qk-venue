<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right" style="margin-top: 10px; margin-left: 20px">
      <el-breadcrumb-item>
        <span style="font-weight: bold">场地管理</span>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        查询场地
      </el-breadcrumb-item>
    </el-breadcrumb>
    <h2 style="text-align: center;">租借场地</h2>
    <venueFilter v-model="venueFilter"
                 @get-venue="page1AndGet"></venueFilter>
    <venue-table :venueData="venueData"
                  @rent-venue="rentVenue1"
                  v-loading="venueLoading"></venue-table>

    <!-- 分页条 -->
    <div class="pagination-container">
      <el-pagination
          v-loading="pageLoading"
          background
          :current-page.sync="page"
          layout="prev, pager, next"
          :total="venueTotal"
          :page-size="10"
          @current-change="getVenueData"></el-pagination>
    </div>

    <el-dialog
        title="租借场地"
        :visible.sync="dialogVisible"
        @close="clearRentForm"
        width="50%">
      <rentVenueForm v-model="rentForm" ref="rentForm"></rentVenueForm>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="rentVenue2">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {getVenueData} from "@/api/venue/getVenueData";
import {rentVenue} from "@/api/venue/rentVenue";

import venueFilter from '@/components/venue/venueFilter'
import venueTable from '@/components/venue/venueTable'
import rentVenueForm from '@/components/venue/rentVenueForm'
export default {
  name: "venue",
  components: {
    venueFilter: venueFilter,
    venueTable: venueTable,
    rentVenueForm: rentVenueForm
  },
  data() {
    return{
      pageLoading: false,
      page: 1,
      venueLoading: false,
      venueTotal: 300,

      dialogVisible: false,

      venueData: [{
        venueId: '123',
        name: '篮球馆1号',
        sportId: '0', // 篮球
        url: '',
        value: 50,
        position: '广东海洋大学东区',
        state: 0,
      }, {
        venueId: '456',
        name: '篮球馆2号',
        sportId: '0', // 篮球
        url: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.IRYxH6g4PcQ2Iyg_s-LvawHaFS?rs=1&pid=ImgDetMain',
        value: 60,
        position: '广东海洋大学东区',
        state: 0,
      }, {
        venueId: '789',
        name: '足球场1号',
        sportId: '1', // 足球
        url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
        value: 60,
        position: '广东海洋大学东区',
        state: 1,
      }],

      venueFilter: {
        venueId: '',
        position: '',
        state: ''
      },

      rentForm: {
        venueId: '',
        name: '',
        phone: '',
        date: '',
        timeRange: {startTime: '', endTime: ''}
      },
    }
  },
  methods: {
    /* 前端函数 */
    // 清空租借表单
    clearRentForm() {
      this.rentForm = {
        venueId: '',
        name: '',
        date: '',
        timeRange: {startTime: '', endTime: ''}
      }
      this.$refs.rentForm.clearValidate();
    },

    // 打开租借表单面板
    rentVenue1(venueId) {
      const item = this.venueData.find(item => {return item.venueId === venueId});
      if(!item) {
        this.$message.error("场地不存在,请刷新!")
        return;
      }
      this.rentForm.venueId = item.venueId;
      this.rentForm.name = item.name;
      this.dialogVisible = true;
    },

    // 页面置1并获取场地数据信息
    page1AndGet() {
      this.page = 1;
      this.getVenueData();
    },

    /* 后端函数 */
    // 获取场地数据信息(包括总页数,一次返回10条数据)
    async getVenueData() {
      this.venueLoading = true;
      try {
        const response = await getVenueData(this.page, this.filter);
        this.venueTotal = response.data.total || 0;
        this.venueData = response.data.data || [];
      }catch (error) {
        console.error("获取场地信息数据失败:" + error);
        this.$message.error("获取场地信息数据失败,请重试!");
      }finally {
        this.venueLoading = false;
      }
    },

    // 租借场地
    async rentVenue2() {
      const flag = await this.$refs.rentForm.validateAll();
      if(!flag) {
        return;
      }
      try {
        const response = await rentVenue(this.rentForm);
        this.dialogVisible = false;
      }catch (error) {
        console.error("租借场地操作失败:" + error);
        this.$message.error("租借场地操作失败,请重试!");
      }
    }
  },
  mounted() {
    this.getVenueData();
  }
}
</script>

<style scoped>
.pagination-container {
  margin-top: 20px; /* 添加顶部间距，让分页条与表格分开 */
  text-align: center; /* 关键：让内部的 inline/inline-block 元素居中 */
}
</style>