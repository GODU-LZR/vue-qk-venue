<template>
  <div>
    <el-row style="display: flex; justify-content: flex-end;">
      <el-button type="primary" plain @click="" v-if="user === '场地管理员' || user === '超级管理员'">新增</el-button>
    </el-row>
    <el-table
        :data="venueTableData.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))"
        style="width: 100%"
        v-loading = "loading">
      <el-table-column
          label="场地图片"
          prop="pictureUrl">
        <template slot-scope="scope">
          <div class="demo-image">
            <div class="block">
              <el-image
                  style="width: 100px; height: 100px"
                  :src="scope.row.pictureUrl"
                  fit="fill">
              </el-image>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
          label="场地名称"
          prop="name">
      </el-table-column>
      <el-table-column
          label="场地价格(元/30分钟)"
          prop="value">
      </el-table-column>
      <el-table-column
          prop="state"
          label="场地状态"
          width="100"
          :filters="[{ text: '可出售', value: '可出售' }, { text: '已下架', value: '已下架'}]"
          :filter-method="filterTag">
        <template slot-scope="scope">
          <el-tag
              :type="chooseTag(scope.row.state)"
              disable-transitions>{{ scope.row.state }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
          align="right">
        <template slot="header" slot-scope="scope">
          <el-input
              v-model="search"
              size="mini"
              placeholder="输入关键字搜索"/>
        </template>
        <template slot-scope="scope">
          <el-button
              type="primary"
              @click="handleRent(scope.row)"
              :disabled="scope.row.state === '已下架'">预约</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
        title="预约场地"
        :visible.sync="dialogVisible"
        width="50%"
        @close="handleCancel">
      <el-descriptions title="场地信息">
        <el-descriptions-item label="场地名称">{{ rentVenueDescriptions.name }}</el-descriptions-item>
        <el-descriptions-item label="场地价格(元/30分钟)">{{ rentVenueDescriptions.value }}</el-descriptions-item>
        <el-descriptions-item label="场地状态">
          <el-tag size="small" :type="chooseTag(rentVenueDescriptions.state)">{{ rentVenueDescriptions.state }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <el-form :model="rentVenueForm" ref="rentVenueForm" label-position="left" label-width="80px">
        <el-form-item label="场地名称" prop="sport">
          <el-input v-model="rentVenueForm.name" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="日期选择" prop="sport">
          <el-date-picker
              v-model="rentVenueForm.dateDay"
              type="date"
              placeholder="选择日期"
              @change="handlePickerChange">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="时间选择" prop="sport">
          <timeChoose
              ref="timeChoose"
              :start-time="'09:00'"
              :end-time="'18:00'"
              :date-day="rentVenueForm.dateDay"
              :disabled-ranges="disabledRanges"
              @submit="handleSubmit"
          />
        </el-form-item>
        <div>
          <span>已选时间:</span>
          <span style="margin-left: 10px">{{ rentVenueForm.dateTime }}</span>
          <span v-show="rentVenueForm.dateTime === ''">请选择连续的时间段</span>
        </div>
        <div>
          <span>预计费用:</span>
          <span style="margin-left: 10px">{{ totalPrice }} 元</span>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import timeChoose from "../components/timeChoose";
export default {
  name: "venueTable",
  components: {
    timeChoose: timeChoose
  },
  data() {
    return {
      user: '超级管理员',
      venueTableData: [{
        pictureUrl: '',
        name: '篮球馆1号',
        value: '50',
        state: '可出售',
      }, {
        pictureUrl: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
        name: '篮球馆2号',
        value: '60',
        state: '可出售',
      }, {
        pictureUrl: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
        name: '足球场1号',
        value: '50',
        state: '已下架',
      }],
      search: '',
      loading: false,
      dialogVisible: false,


      rentVenueDescriptions: {
        pictureUrl: '',
        name: '',
        value: '',
        state: '',
      },
      rentVenueForm: {
        name: '',
        dateDay: '',
        dateTime: '',
      },
      disabledRanges: [
        '10:00-11:00',
        '14:00-15:00',
        '16:00-16:30',
      ]
    }
  },

  computed: {
    // 计算总价格
    totalPrice() {
      // 1. 查找对应的场地信息
      const venue = this.venueTableData.find((item) => item.name === this.rentVenueForm.name);
      if (!venue) {
        return 0;
      }

      // 2. 获取价格（元/30分钟）
      const pricePer30Minutes = parseFloat(venue.value);
      if (isNaN(pricePer30Minutes)) {
        console.error('价格格式错误');
        return 0;
      }

      // 3. 计算总时长（分钟）
      const duration = this.calculateDuration(this.rentVenueForm.dateTime);
      if (duration <= 0) {
        return 0;
      }

      // 4. 计算总价格
      const totalPrice = (duration / 30) * pricePer30Minutes;
      return totalPrice.toFixed(2); // 保留两位小数
    },
  },

  methods: {
    filterTag(value, row) {
      return row.state === value;
    },
    chooseTag(value) {
      if (value === '可出售') {
        // 未开始
        return 'success';
      }
      if (value === '已下架') {
        // 已结束
        return 'info';
      }
    },
    handleRent(row) {
      this.rentVenueDescriptions.pictureUrl = row.pictureUrl;
      this.rentVenueDescriptions.name = row.name;
      this.rentVenueDescriptions.value = row.value;
      this.rentVenueDescriptions.state = row.state;
      this.rentVenueForm.name = row.name;

      this.dialogVisible = true;
    },

    handleCancel() {
      this.rentVenueForm.dateDay = '';
      this.rentVenueForm.dateTime = '';
      this.$nextTick(() => {
        this.$refs.timeChoose.clearSelection();
      });
      this.dialogVisible = false;
    },

    handlePickerChange() {
      this.rentVenueForm.dateTime = '';
      this.$nextTick(() => {
        this.$refs.timeChoose.clearSelection();
      });
      // 重新获取禁用时间

    },

    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          alert('submit!');
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },

    handleSubmit(timeRange) {
      if (!timeRange) {
        this.rentVenueForm.dateTime = ""; // 清空时间段
        return;
      }
      // 格式化 timeRange 为 'hh:mm-hh:mm'
      // 将格式化后的时间段存储到 rentVenueForm 的 dateTime 属性中
      this.rentVenueForm.dateTime = `${timeRange.startTime}-${timeRange.endTime}`;
    },

    // 将 hh:mm 格式的时间转换为分钟数
    parseTimeToMinutes(time) {
      const [hour, minute] = time.split(':').map(Number);
      return hour * 60 + minute;
    },

    // 解析 hh:mm-hh:mm 格式的时间段，计算总时长（分钟）
    calculateDuration(dateTime) {
      if (!dateTime) return 0;

      const [startTime, endTime] = dateTime.split('-');
      const start = this.parseTimeToMinutes(startTime);
      const end = this.parseTimeToMinutes(endTime);

      return end - start; // 返回总时长（分钟）
    },
  }
}
</script>

<style scoped>
::v-deep .el-dialog {
  border-radius: 10px;
}

::v-deep .el-dialog__header {
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

::v-deep .el-dialog__footer {
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}
</style>