<template>
  <div class="infinite-list-wrapper"
       style="overflow:auto; margin-top: 20px">
    <ul class="infinite-list"
        v-infinite-scroll="moreOrder"
        :infinite-scroll-disabled="noMore || moreLoading">
      <li v-for="data in orderData" class="infinite-list-item">
        <h2 style="margin-top: 0; text-align: center">订单详情</h2>

        <el-descriptions title="个人信息" :column="3" size="medium" border>
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

        <el-descriptions title="场地信息" :column="3" size="medium" border style="margin-top: 30px">
          <el-descriptions-item>
            <template slot="label">
              场地名称
            </template>
            {{ data.name }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              场地位置
            </template>
            {{ data.position }}
          </el-descriptions-item>
          <el-descriptions-item :label-style="{ width: '200px' }">
            <template slot="label">
              场地价格(元/30分钟)
            </template>
            {{ data.value }} 元
          </el-descriptions-item>
        </el-descriptions>

        <el-descriptions title="账单信息" :column="4" border style="margin-top: 30px">
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
            {{ data.startTime }} - {{ data.endTime }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              <i class="el-icon-user"></i>审核人
            </template>
            {{ data.auditPeople || '-' }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              <i class="el-icon-view"></i>付款状态
            </template>
            <el-tag size="small" :type="payStateText(data.payState)[0]">{{ payStateText(data.payState)[1] }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              审核状态
            </template>
            <el-tag size="small" :type="stateText(data.state)[0]">{{ stateText(data.state)[1] }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              实际付款(元)
            </template>
            {{ data.payment }} 元
          </el-descriptions-item>
        </el-descriptions>

        <div class="action-box">
          <span class="payment-label" v-if="false">应付款:
            <span>￥100</span>
          </span>
          <!-- 付款按钮 -->
          <el-button type="primary" class="pay-button" v-if="data.payState === 0">付款</el-button>
          <!-- 平替场地按钮 -->
          <el-button type="success" class="pay-button"
                     v-if="(data.state !== 2 && data.state !== 3 ) &&
                     isInRangeTime(data.endTime)"
                     @click="replaceVenue(data.orderId)">更换当前场地</el-button>
        </div>
      </li>
    </ul>

    <p v-if="moreLoading" style="text-align: center;">加载中<i class="el-icon-loading"></i></p>
    <p v-if="noMore && orderData.length > 0" style="text-align: center;">没有更多了...</p>
    <el-empty :image-size="200" v-show="orderData.length <= 0 && !moreLoading"></el-empty>

  </div>
</template>

<script>
export default {
  name: "myVenueUL",
  props: {
    orderData: {
      type: Array,
      required: true
    },
    moreLoading: {
      type: Boolean,
      default: false
    },
    noMore: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogVisible: false
    }
  },

  methods: {
    // 将状态转为文字
    stateText(state) {
      if(state === 0) {
        return ['primary', '待审核'];
      }else if(state === 1) {
        return ['success', '已通过'];
      }else if(state === 2) {
        return ['danger', '已否决'];
      }else if(state === 3) {
        return ['danger', '已撤销'];
      }else if(state === 4) {
        return ['warning', '更换场地'];
      }else {
        return ['info', '状态未知'];
      }
    },

    payStateText(payState) {
      if(payState === 0) {
        return ['danger', '未付款'];
      }else if(payState === 1) {
        return ['success', '已付款'];
      }else {
        return ['info', '状态未知'];
      }
    },

    // 判断当前时间是否在时间段内
    isInRangeTime(endTime) {
      const now = new Date();
      const endDate = new Date(endTime);

      if (isNaN(endDate.getTime())) {
        return false; // 结束时间无效
      }
      return now <= endDate;
    },



    // 下拉获取更多订单
    moreOrder() {
      this.$emit('more-order');
    },

    // 请求更换场地
    replaceVenue(orderId) {
      this.$emit('replace-venue', orderId);
    },
  }
}
</script>

<style scoped>
.infinite-list-wrapper {
  /* 确保这里有高度或最大高度 */
  height: 480px;
  /* 或者 max-height: calc(100vh - 200px); 减去页面其他元素的高度 */
  /* overflow: auto; /* 已经写在行内样式了，也可以写在这里 */
}

.infinite-list {
  padding: 0 20px;
  margin: 0;
}

.infinite-list-item {
  position: relative;
  list-style: none;
  padding: 20px;
  border: 1px solid #000;
  margin-bottom: 10px;
  border-radius: 10px
}

.action-box {
  width: 100%; /* 占据父容器（li）的全部宽度 */
  display: flex;
  justify-content: flex-end; /* 将子元素（按钮）推到右侧 */
  align-items: center; /* 垂直居中按钮 */
  height: 50px; /* 示例高度，你可以根据需要调整 */
}

.payment-label {
  margin-right: 50px; /* 在文本和按钮之间添加间距 */
  font-size: 24px; /* 可以调整字体大小 */
  color: #333; /* 可以调整字体颜色 */
  /* 确保文本不会换行 */
  white-space: nowrap;
}

/* 付款按钮样式 */
.pay-button {
  width: 10%; /* 占据父容器 payment-action-box 宽度的 10% */
  height: 100%; /* 占据父容器 payment-action-box 高度的 100% */
  padding: 0; /* 移除默认 padding，让按钮完全填充高度 */
  border-radius: 0;
  font-size: 18px;
}
</style>