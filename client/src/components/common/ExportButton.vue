<template>
  <el-button
    :type="type"
    :icon="icon"
    :loading="loading"
    :disabled="disabled"
    @click="handleExport"
  >
    {{ text }}
  </el-button>
</template>

<script>
export default {
  name: 'ExportButton',
  props: {
    text: {
      type: String,
      default: '导出',
    },
    type: {
      type: String,
      default: 'success',
    },
    icon: {
      type: String,
      default: 'el-icon-download',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    exportApi: {
      type: Function,
      required: true,
    },
    filename: {
      type: String,
      default: 'export',
    },
  },
  methods: {
    async handleExport() {
      try {
        this.$emit('before-export');

        const response = await this.exportApi();

        if (response && response.data) {
          const blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${this.filename}_${Date.now()}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          this.$message.success('导出成功');
          this.$emit('success', response);
        }
      } catch (error) {
        this.$message.error('导出失败');
        this.$emit('error', error);
      }
    },
  },
};
</script>

<style scoped>
</style>
