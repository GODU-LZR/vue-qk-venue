<template>
  <div class="container">
    <el-table
        :data="venueData"
        style="width: 100%; min-height: 420px">
      <el-table-column
          label="场地图片"
          prop="url">
        <template slot-scope="scope">
<!--          <div class="demo-image">-->
<!--            <div class="block">-->
<!--              <el-image-->
<!--                  style="width: 100px; height: 100px"-->
<!--                  :src="scope.row.url"-->
<!--                  fit="fill">-->
<!--              </el-image>-->
<!--            </div>-->
<!--          </div>-->
          <el-upload
              class="avatar-uploader"
              action="https://jsonplaceholder.typicode.com/posts/"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload">
            <img v-if="scope.row.url" :src="scope.row.url" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
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
              @click="updateVenue(scope.row.venueId)">修改</el-button>
          <el-button
              type="danger"
              size="mini"
              @click="handleState(scope.row.venueId, scope.row.state)"
              v-if="scope.row.state === 0">下架</el-button>
          <el-button
              type="success"
              size="mini"
              @click="handleState(scope.row.venueId, scope.row.state)"
              v-else>上架</el-button>
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

    }
  },
  methods: {
    handleAvatarSuccess(res, file) {
      this.imageUrl = URL.createObjectURL(file.raw);
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },

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

    // 申请修改场地信息
    updateVenue(venueId) {
      this.$emit('update-venue', venueId);
    },

    // 申请上架和下架场地信息
    handleState(venueId, state) {
      let stateStr = this.stateText(state === 0?1:0)[1];
      this.$confirm('是否将该场地状态设置为' + stateStr, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      .then(() => {
        this.$emit('handle-state', venueId);
      })
      .catch(() => {
        return;
      });
    }
  }
}
</script>

<style scoped>
.container {
  padding:0 20px;
}

.avatar-uploader .el-upload {
  /*border: 1px dashed #d9d9d9;*/
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;

  border: 1px dashed #8c939d;
  box-sizing: border-box;
}
.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style>