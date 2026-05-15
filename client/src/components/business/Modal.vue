<template>
  <el-dialog
    :visible.sync="isVisible"
    :title="title"
    :width="width"
    :top="top"
    :fullscreen="fullscreen"
    :modal="modal"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    :destroy-on-close="destroyOnClose"
    @close="handleClose"
    @open="handleOpen"
  >
    <slot></slot>

    <div v-if="$slots.footer" slot="footer">
      <slot name="footer"></slot>
    </div>
    <div v-else-if="showFooter" slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{ cancelText }}</el-button>
      <el-button type="primary" :loading="loading" @click="handleConfirm">
        {{ confirmText }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    width: {
      type: String,
      default: '50%',
    },
    top: {
      type: String,
      default: '15vh',
    },
    fullscreen: {
      type: Boolean,
      default: false,
    },
    modal: {
      type: Boolean,
      default: true,
    },
    closeOnClickModal: {
      type: Boolean,
      default: false,
    },
    closeOnPressEscape: {
      type: Boolean,
      default: true,
    },
    showClose: {
      type: Boolean,
      default: true,
    },
    showFooter: {
      type: Boolean,
      default: true,
    },
    destroyOnClose: {
      type: Boolean,
      default: false,
    },
    confirmText: {
      type: String,
      default: '确定',
    },
    cancelText: {
      type: String,
      default: '取消',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    isVisible: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      },
    },
  },
  methods: {
    handleClose() {
      this.$emit('close');
    },
    handleOpen() {
      this.$emit('open');
    },
    handleCancel() {
      this.$emit('cancel');
      this.isVisible = false;
    },
    handleConfirm() {
      this.$emit('confirm');
    },
  },
};
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
