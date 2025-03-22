<template>
  <div>
    <ul class="infinite-list" style="overflow:auto">
      <li v-for="data in ShoppingEquipmentData" class="infinite-list-item" style="position: relative;list-style: none; padding: 30px; border: 1px solid #000; margin-bottom: 10px; border-radius: 10px">
        <el-descriptions class="margin-top" title="个人信息" :column="3" size="medium" border>
          <el-descriptions-item>
            <template slot="label">
              <i class="el-icon-s-custom"></i>用户id
            </template>
            {{ data.userId }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              <i class="el-icon-s-custom"></i>用户名
            </template>
            {{ data.username }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              <i class="el-icon-phone"></i>联系电话
            </template>
            {{ data.phone }}
          </el-descriptions-item>
        </el-descriptions>

        <el-descriptions class="margin-top" title="账单信息" :column="3" :size="size" border style="margin-top: 30px">
          <el-descriptions-item>
            <template slot="label">
              <i class="el-icon-key"></i>账单编号
            </template>
            {{ data.orderId }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              <i class="el-icon-time"></i>下单时间
            </template>
            {{ data.orderTime }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              <i class="el-icon-time"></i>付款时间
            </template>
            {{ data.payTime }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              <i class="el-icon-date"></i>使用时间
            </template>
            {{ data.rentTime }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              <i class="el-icon-user"></i>审核人
            </template>
            {{ data.auditPeople }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              <i class="el-icon-view"></i>审核状态
            </template>
            <el-tag size="small">{{ data.state }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              付款状态
            </template>
            <el-tag size="small">{{ data.payment === null?'未付款':'已付款' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              实际付款(元)
            </template>
            {{ data.payment }}
          </el-descriptions-item>

        </el-descriptions>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "myVenueUL",
  data() {
    return {
      ShoppingEquipmentData: [
        {
          userId: '1234678',
          username: '张三',
          phone: '12345678911',

          orderId: '12345678',
          name: '篮球场一号',
          orderTime: '2025-01-01 12:50:30',
          payTime: '2025-01-01 12:55:30',
          rentTime: '2025-03-03 16:00 - 2025-03-03 17:00',
          auditPeople: '张三',
          state: '已审核',
          payment: 102
        },
        {
          userId: '1234678',
          username: '张三',
          phone: '12345678911',

          orderId: '12345679',
          name: '足球场一号',
          orderTime: '2025-01-01 12:50:30',
          payTime: '2025-01-01 12:55:30',
          rentTime: '2025-03-03 14:00 - 2025-03-03 16:00',
          auditPeople: '李四',
          state: '未审核',
          payment: 102
        }
      ],
      dialogVisible: false
    }
  },

  methods: {

  }
}
</script>

<style scoped>

</style>