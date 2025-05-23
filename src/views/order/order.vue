<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right" style="margin-top: 10px; margin-left: 20px">
      <el-breadcrumb-item>
        <span style="font-weight: bold">场地管理</span>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        场地订单
      </el-breadcrumb-item>
    </el-breadcrumb>
    <h2 style="text-align: center;">场地订单</h2>
    <orderFilter v-model="filter" @get-order="newData"></orderFilter>
    <orderUl :orderData="orderData"
             @more-order="moreData"
             @replace-venue="replaceVenue1"
             v-loading.fullscreen.lock="newLoading"
             :moreLoading="moreLoading"
             :noMore="noMore"></orderUl>

    <el-dialog
        title="可更换场地"
        :visible.sync="dialogVisible"
        width="60%">
          <replaceForm :orderId="replaceOrderId" @replace-venue="replaceVenue2"></replaceForm>
          <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {getOrderData} from "@/api/order/getOrderData";
import {replaceVenue} from "@/api/order/replaceVenue";

import orderFilter from '@/components/order/orderFilter'
import orderUl from '@/components/order/orderUl'
import replaceForm from '@/components/order/replaceForm'
export default {
  name: "order",
  components: {
    orderUl: orderUl,
    orderFilter: orderFilter,
    replaceForm: replaceForm
  },
  data() {
    return{
      dialogVisible: false,
      newLoading: false,
      moreLoading: false,
      noMore: false,
      page: 1,

      orderData: [
        {
          userId: '1234678',
          username: '张三',
          phone: '12345678911',

          venueId: '123',
          name: '篮球场一号',
          sportId: '0',
          position: '广东海洋大学东区',
          value: 60,

          orderId: '12345678',
          orderTime: '2025-01-01 12:50:30',
          payTime: '2025-01-01 12:55:30',
          startTime: '2025-05-16 20:00',
          endTime: '2025-07-01 13:00',
          auditPeople: '张三',
          state: 0, // 0-待审核, 1-已通过, 2-已否决, 3-已撤销, 4-更换场地
          payState: 0, // 0-未付款, 1-已付款
          payment: 102
        },
        {
          userId: '1234678',
          username: '张三',
          phone: '12345678911',

          venueId: '456',
          name: '足球场一号',
          sportId: '0',
          position: '广东海洋大学东区',
          value: 60,

          orderId: '12345679',
          orderTime: '2025-01-01 12:50:30',
          payTime: '2025-01-01 12:55:30',
          startTime: '2025-01-01 12:00',
          endTime: '2025-06-01 13:00',
          auditPeople: '李四',
          state: 0,
          payState: 1, // 0-未付款, 1-已付款
          payment: 102
        }
      ],

      filter: {
        venueId: '',
        state: '',
        payment:''
      },

      replaceOrderId: '',
    }
  },
  methods: {
    /* 前端函数 */
    // 获取更多数据
    async moreData() {
      this.page++;
      this.moreLoading = true;
      try{
        const data = await this.getOrderData();
        if(data.length <= 0) {
          this.noMore = true;
          return;
        }
        this.orderData.push(...data);
      }catch (error) {
        this.page--;
        console.error("获取订单信息数据失败:" + error);
        this.$message.error("获取订单信息数据失败,请重试!");
      } finally {
        this.moreLoading = false;
      }
    },

    // 获取新的数据
    async newData() {
      this.page = 1;
      this.newLoading = true;
      try {
        const data = await this.getOrderData();
        this.orderData = data;
      } catch (error) {
        this.page--;
        console.error("获取订单信息数据失败:" + error);
        this.$message.error("获取订单信息数据失败,请重试!");
      } finally {
        this.newLoading = false;
      }
    },

    /* 后端函数 */
    // 获取订单数据
    async getOrderData() {
      try {
        const response = await getOrderData(this.page, this.filter);
        return response.data;
      }catch (error) {
        throw error;
      }
    },

    // 请求更换场地:获取选择场地数据
    replaceVenue1(orderId) {
      const data = this.orderData.find(item => item.orderId === orderId)
      if(!data) {
        this.$message.error("订单不存在,请刷新!");
        return;
      }
      this.dialogVisible = true;
      this.replaceOrderId = data.orderId;
    },

    // 发送更换场地的请求
    async replaceVenue2(venueForm) {
      try{
        const response = await replaceVenue(this.replaceOrderId, venueForm);
        this.dialogVisible = false;
      } catch (error) {
        console.error("更换场地操作失败:" + error);
        this.$message.error("更换场地操作失败,请重试!");
        return;
      }
      await this.newData();
    }
  },
  mounted() {
    this.newData();
  }
}
</script>

<style scoped>

</style>