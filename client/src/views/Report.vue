<template>
  <div class="report-page">
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">本月销售总额</p>
              <p class="stat-value">¥{{ monthStats.salesAmount }}</p>
            </div>
            <div class="stat-icon sales-icon">
              <el-icon :size="32"><TrendCharts /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">本月采购总额</p>
              <p class="stat-value">¥{{ monthStats.purchaseAmount }}</p>
            </div>
            <div class="stat-icon purchase-icon">
              <el-icon :size="32"><ShoppingCart /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">本月毛利</p>
              <p class="stat-value">¥{{ monthStats.profit }}</p>
            </div>
            <div class="stat-icon profit-icon">
              <el-icon :size="32"><Money /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="main-content">
      <el-col :span="24">
        <el-card class="action-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">报表中心</span>
            </div>
          </template>
          <div class="quick-actions">
            <div class="action-item" @click="showReport('sales')">
              <el-icon :size="40" color="#409EFF"><Sell /></el-icon>
              <span>销售报表</span>
            </div>
            <div class="action-item" @click="showReport('purchase')">
              <el-icon :size="40" color="#67C23A"><ShoppingBag /></el-icon>
              <span>采购报表</span>
            </div>
            <div class="action-item" @click="showReport('inventory')">
              <el-icon :size="40" color="#E6A23C"><Box /></el-icon>
              <span>库存报表</span>
            </div>
            <div class="action-item" @click="showReport('finance')">
              <el-icon :size="40" color="#F56C6C"><Coin /></el-icon>
              <span>财务报表</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">销售趋势图</span>
            </div>
          </template>
          <div ref="salesTrendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">收支对比图</span>
            </div>
          </template>
          <div ref="financeChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { TrendCharts, ShoppingCart, Money, Sell, ShoppingBag, Box, Coin } from '@element-plus/icons-vue'

const salesTrendChartRef = ref(null)
const financeChartRef = ref(null)
let salesTrendChart = null
let financeChart = null

const monthStats = reactive({
  salesAmount: '568,000',
  purchaseAmount: '156,800',
  profit: '89,500'
})

const initSalesTrendChart = () => {
  if (!salesTrendChartRef.value) return
  salesTrendChart = echarts.init(salesTrendChartRef.value)
  salesTrendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['销售额', '订单量'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月'] },
    yAxis: [
      { type: 'value', name: '销售额', axisLabel: { formatter: '¥{value}' } },
      { type: 'value', name: '订单量', axisLabel: { formatter: '{value}单' } }
    ],
    series: [
      { name: '销售额', type: 'bar', data: [320000, 450000, 380000, 520000, 568000], itemStyle: { color: '#409EFF' } },
      { name: '订单量', type: 'line', yAxisIndex: 1, data: [120, 180, 150, 210, 230], smooth: true, itemStyle: { color: '#67C23A' } }
    ]
  })
}

const initFinanceChart = () => {
  if (!financeChartRef.value) return
  financeChart = echarts.init(financeChartRef.value)
  financeChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['收入', '支出'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月'] },
    yAxis: { type: 'value', axisLabel: { formatter: '¥{value}' } },
    series: [
      { name: '收入', type: 'bar', data: [320000, 450000, 380000, 520000, 568000], itemStyle: { color: '#67C23A' } },
      { name: '支出', type: 'bar', data: [150000, 180000, 160000, 200000, 156800], itemStyle: { color: '#F56C6C' } }
    ]
  })
}

const showReport = (type) => ElMessage.info(`${type}报表功能开发中`)

onMounted(() => {
  setTimeout(() => {
    initSalesTrendChart()
    initFinanceChart()
  }, 100)
  window.addEventListener('resize', () => { salesTrendChart?.resize(); financeChart?.resize() })
})

onUnmounted(() => {
  salesTrendChart?.dispose()
  financeChart?.dispose()
})
</script>

<style scoped>
.report-page { padding: 0; }
.stats-row { margin-bottom: 20px; }
.stat-card, .action-card, .chart-card { border-radius: 8px; margin-bottom: 20px; }
.main-content { margin-bottom: 20px; }
.stat-content, .card-header { display: flex; justify-content: space-between; align-items: center; }
.stat-label { margin: 0 0 8px 0; font-size: 14px; color: #909399; }
.stat-value { margin: 0; font-size: 24px; font-weight: 600; color: #303133; }
.stat-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; }
.sales-icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
.purchase-icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
.profit-icon { background: linear-gradient(135deg, #E6A23C, #ebb563); }
.quick-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; padding: 20px 0; }
.action-item { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 30px 20px; background: #f5f7fa; border-radius: 12px; cursor: pointer; transition: all 0.3s; }
.action-item:hover { background: #ecf5ff; transform: translateY(-5px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08); }
.action-item span { font-size: 16px; font-weight: 500; color: #606266; }
.chart-container { height: 300px; width: 100%; }
.card-title { font-size: 16px; font-weight: 600; color: #303133; }
</style>
