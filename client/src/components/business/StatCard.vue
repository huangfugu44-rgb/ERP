<template>
  <div class="stat-card" :class="[`stat-card--${type}`]">
    <div class="stat-card__icon">
      <i :class="icon"></i>
    </div>
    <div class="stat-card__content">
      <div class="stat-card__title">{{ title }}</div>
      <div class="stat-card__value">
        <count-to
          :start-val="0"
          :end-val="value"
          :duration="duration"
          :decimals="decimals"
          separator=","
        ></count-to>
      </div>
      <div v-if="description" class="stat-card__description">
        {{ description }}
      </div>
    </div>
  </div>
</template>

<script>
const CountTo = {
  functional: true,
  render(h, { props }) {
    return h('span', {}, [props.value.toLocaleString()]);
  },
};

export default {
  name: 'StatCard',
  components: {
    CountTo,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    value: {
      type: [Number, String],
      required: true,
    },
    icon: {
      type: String,
      default: 'el-icon-data-line',
    },
    type: {
      type: String,
      default: 'primary',
      validator: (val) => ['primary', 'success', 'warning', 'danger', 'info'].includes(val),
    },
    decimals: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 2000,
    },
    description: {
      type: String,
      default: '',
    },
  },
};
</script>

<style scoped>
.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card__icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 28px;
}

.stat-card--primary .stat-card__icon {
  background: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.stat-card--success .stat-card__icon {
  background: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.stat-card--warning .stat-card__icon {
  background: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.stat-card--danger .stat-card__icon {
  background: rgba(245, 108, 108, 0.1);
  color: #F56C6C;
}

.stat-card--info .stat-card__icon {
  background: rgba(144, 147, 153, 0.1);
  color: #909399;
}

.stat-card__content {
  flex: 1;
}

.stat-card__title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-card__value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-card__description {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style>
