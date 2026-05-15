<template>
  <div class="search-form">
    <el-form
      :inline="true"
      :model="formData"
      :rules="rules"
      ref="searchForm"
      class="form-inline"
    >
      <slot :formData="formData"></slot>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">
          查询
        </el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">
          重置
        </el-button>
        <el-button
          v-if="showAdvanced"
          link
          @click="toggleAdvanced"
        >
          {{ showAdvancedContent ? '收起' : '展开' }}
          <i :class="showAdvancedContent ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
        </el-button>
      </el-form-item>
    </el-form>

    <div v-if="showAdvancedContent" class="advanced-search">
      <slot name="advanced" :formData="formData"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchForm',
  props: {
    formData: {
      type: Object,
      default: () => ({}),
    },
    rules: {
      type: Object,
      default: () => ({}),
    },
    showAdvanced: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showAdvancedContent: false,
    };
  },
  methods: {
    handleSearch() {
      this.$emit('search', { ...this.formData });
    },
    handleReset() {
      this.$refs.searchForm.resetFields();
      this.$emit('reset');
    },
    toggleAdvanced() {
      this.showAdvancedContent = !this.showAdvancedContent;
    },
    validate() {
      return new Promise((resolve, reject) => {
        this.$refs.searchForm.validate((valid) => {
          if (valid) {
            resolve();
          } else {
            reject(new Error('表单验证失败'));
          }
        });
      });
    },
  },
};
</script>

<style scoped>
.search-form {
  background: #fff;
  padding: 20px;
  margin-bottom: 16px;
  border-radius: 4px;
}

.form-inline {
  margin-bottom: 0;
}

.advanced-search {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}
</style>
