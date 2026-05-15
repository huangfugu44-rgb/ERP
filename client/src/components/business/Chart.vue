<template>
  <div class="chart-wrapper">
    <div v-if="title" class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <div v-if="$slots.toolbar" class="chart-toolbar">
        <slot name="toolbar"></slot>
      </div>
    </div>
    <div ref="chartRef" class="chart-container" :style="{ height: height }"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'Chart',
  props: {
    title: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'line',
      validator: (val) => ['line', 'bar', 'pie', 'ring', 'scatter', 'map'].includes(val),
    },
    data: {
      type: Object,
      required: true,
    },
    height: {
      type: String,
      default: '300px',
    },
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.setOption();
      },
    },
  },
  mounted() {
    this.initChart();
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.chart) {
      this.chart.dispose();
    }
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chartRef);
      this.setOption();
    },
    setOption() {
      if (!this.chart) return;

      const baseOption = this.getBaseOption();
      const customOption = this.options;
      this.chart.setOption({ ...baseOption, ...customOption }, true);
    },
    getBaseOption() {
      const optionGenerators = {
        line: () => this.getLineOption(),
        bar: () => this.getBarOption(),
        pie: () => this.getPieOption(),
        ring: () => this.getRingOption(),
        scatter: () => this.getScatterOption(),
      };

      const generator = optionGenerators[this.type];
      return generator ? generator() : {};
    },
    getLineOption() {
      return {
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: this.data.legend || [],
          bottom: 0,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: this.data.xAxis || [],
        },
        yAxis: {
          type: 'value',
        },
        series: this.data.series || [],
      };
    },
    getBarOption() {
      return {
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: this.data.legend || [],
          bottom: 0,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: this.data.xAxis || [],
        },
        yAxis: {
          type: 'value',
        },
        series: this.data.series || [],
      };
    },
    getPieOption() {
      return {
        tooltip: {
          trigger: 'item',
        },
        legend: {
          orient: 'vertical',
          right: 'right',
          top: 'center',
        },
        series: [
          {
            type: 'pie',
            radius: '60%',
            data: this.data.series || [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      };
    },
    getRingOption() {
      return this.getPieOption();
    },
    getScatterOption() {
      return {
        tooltip: {
          trigger: 'item',
        },
        xAxis: {
          type: 'value',
        },
        yAxis: {
          type: 'value',
        },
        series: this.data.series || [],
      };
    },
    handleResize() {
      if (this.chart) {
        this.chart.resize();
      }
    },
  },
};
</script>

<style scoped>
.chart-wrapper {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-toolbar {
  display: flex;
  gap: 8px;
}

.chart-container {
  width: 100%;
}
</style>
