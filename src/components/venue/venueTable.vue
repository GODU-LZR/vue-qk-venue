<template>
  <div class="container">
    <el-table
        :data="venueData"
        style="width: 100%; min-height: 420px">
      <el-table-column
          label="场地图片"
          prop="url">
        <template slot-scope="scope">
          <div class="demo-image">
            <div class="block">
              <el-image
                  style="width: 100px; height: 100px"
                  :src="scope.row.url"
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
          label="位置"
          prop="position">
      </el-table-column>
      <el-table-column
          label="场地价格(元/30分钟)"
          prop="value">
      </el-table-column>
      <el-table-column
          prop="state"
          label="场地状态"
          width="100"
          :filters="[{ text: '可租借', value: 0 }, { text: '已下架', value: 1}]"
          :filter-method="filterTag">
        <template slot-scope="scope">
          <el-tag
              :type="stateText(scope.row.state)[0]"
              disable-transitions>{{ stateText(scope.row.state)[1] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
          align="right">
        <template slot-scope="scope">
          <el-button
              type="primary"
              size="mini"
              @click="rentVenue(scope.row.venueId)"
              :disabled="scope.row.state === 1">租借</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "venueTable",
  props: {
    venueData: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      rentVenue(venueId) {
        this.$emit('rent-venue', venueId);
      }
    }
  },

  computed: {

  },

  methods: {
    filterTag(value, row) {
      return row.state === value;
    },

    stateText(value) {
      if (value === 0) {
        // 未开始
        return ['success', '可租借'];
      }
      if (value === 1) {
        // 已结束
        return ['info', '已下架'];
      }
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

.container {
  padding: 20px;
}
</style>