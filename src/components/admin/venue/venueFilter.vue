<template>
  <div class="venue-filter">
    <el-form :model="form" label-width="80px" class="filter-form" label-position="left" ref="ruleForm">
      <el-row :gutter="60">
        <el-col :span="7">
          <el-form-item label="场地名称" prop="sport">
            <el-select v-model="form.venueId"
                       placeholder="请选择场地名称"
                       style="width: 100%"
                       filterable
                       remote
                       :remote-method="getVenueOptions">
              <el-option
                  v-for="item in venueOptions"
                  :key="item.venueId"
                  :label="item.name"
                  :value="item.venueId">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="7">
          <el-form-item label="场地位置" prop="gameId">
            <el-input v-model="form.position" placeholder="请输入场地位置(支持模糊查询)"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="7">
          <el-form-item label="场地状态" prop="state">
            <el-select v-model="form.state"
                       placeholder="请选择场地状态"
                       style="width: 100%"
                       remote
                       filterable>
              <el-option
                  v-for="item in [{state: 1, name: '可租借'}, {state: 2, name: '已下架'}]"
                  :key="item.state"
                  :label="item.name"
                  :value="item.state">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="3" style="display: flex; align-items: center; justify-content: flex-end;">
          <el-button type="primary" @click="getVenueData">查询</el-button>
          <el-button @click="resetForm('ruleForm')">重置</el-button>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import {getVenueOptions} from "@/api/options/getVenueOptions";
export default {
  name: 'venueFilter',
  props: {
    value: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      form: {},

      venueOptions: []
    };
  },
  methods: {
    // 重置表单
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    // 查询赛事
    getVenueData() {
      this.$emit('get-venue');
    },

    /* 后端函数 */
    async getVenueOptions(key) {
      try{
        const response = await getVenueOptions(key);
        this.venueOptions = response.data;
      }catch (error) {
        console.error("获取场地待选项失败:" + error);
        this.$message.error("获取场地待选项失败,请重试!");
      }
    }
  },
  watch: {
    value: {
      handler(newValue) {
        if (JSON.stringify(newValue) !== JSON.stringify(this.form)) {
          this.form = JSON.parse(JSON.stringify(newValue));
        }
      },
      deep: true,
      immediate: true // 组件创建时立即执行一次,初始化form
    },
    form: {
      handler(newValue) {
        if (JSON.stringify(newValue) !== JSON.stringify(this.value)) {
          this.$emit('input', JSON.parse(JSON.stringify(newValue)));
        }
      },
      deep: true
    }
  },
  mounted() {

  }
};
</script>

<style scoped>
.venue-filter {
  /* 可选：为整个过滤器区域添加一些样式 */
  padding: 20px;
  border: 1px solid #ebeef5; /* Element UI 常用边框颜色 */
  border-radius: 5px;
  margin: 20px 20px;
}

.filter-form {
  margin-top: 20px; /* 标签页和表单之间的间隔 */
}

/* 可选：调整表单项的底部外边距，使其更紧凑 */
.filter-form .el-form-item {
  margin-bottom: 0; /* 移除默认的底部外边距 */
}

/* 如果需要调整 el-col 内部 form-item 的对齐或间距，可以在这里添加样式 */
</style>
