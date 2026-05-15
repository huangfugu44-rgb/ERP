<template>
  <transition name="message-fade" mode="out-in">
    <div
      v-if="visible"
      class="message-wrapper"
      :class="[`message-wrapper--${type}`, { 'is-center': center }]"
    >
      <div class="message-content">
        <i v-if="showIcon" :class="iconClass"></i>
        <span class="message-text">{{ message }}</span>
        <i v-if="closable" class="el-icon-close close-icon" @click="handleClose"></i>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Message',
  props: {
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'info',
      validator: (val) => ['success', 'warning', 'error', 'info'].includes(val),
    },
    duration: {
      type: Number,
      default: 3000,
    },
    showIcon: {
      type: Boolean,
      default: true,
    },
    closable: {
      type: Boolean,
      default: false,
    },
    center: {
      type: Boolean,
      default: false,
    },
    onClose: {
      type: Function,
      default: null,
    },
  },
  data() {
    return {
      visible: true,
    };
  },
  computed: {
    iconClass() {
      const iconMap = {
        success: 'el-icon-success',
        warning: 'el-icon-warning',
        error: 'el-icon-error',
        info: 'el-icon-info',
      };
      return iconMap[this.type];
    },
  },
  mounted() {
    if (this.duration > 0) {
      setTimeout(() => {
        this.close();
      }, this.duration);
    }
  },
  methods: {
    close() {
      this.visible = false;
      if (this.onClose) {
        this.onClose();
      }
      this.$emit('close');
    },
    handleClose() {
      this.close();
    },
  },
};
</script>

<style scoped>
.message-wrapper {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  max-width: 600px;
  padding: 14px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.15);
}

.message-wrapper--success {
  background: #f0f9ff;
  border: 1px solid #67C23A;
  color: #67C23A;
}

.message-wrapper--warning {
  background: #fdf6ec;
  border: 1px solid #E6A23C;
  color: #E6A23C;
}

.message-wrapper--error {
  background: #fef0f0;
  border: 1px solid #F56C6C;
  color: #F56C6C;
}

.message-wrapper--info {
  background: #f4f4f5;
  border: 1px solid #909399;
  color: #909399;
}

.message-wrapper.is-center {
  text-align: center;
}

.message-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-text {
  font-size: 14px;
}

.close-icon {
  cursor: pointer;
  margin-left: auto;
}

.message-fade-enter-active,
.message-fade-leave-active {
  transition: all 0.3s ease;
}

.message-fade-enter,
.message-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
