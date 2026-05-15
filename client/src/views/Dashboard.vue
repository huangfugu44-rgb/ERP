<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :lg="6" v-for="stat in stats" :key="stat.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-title">{{ stat.title }}</p>
              <p class="stat-value">{{ stat.value }}</p>
              <p class="stat-trend" :class="stat.trendType">
                <el-icon v-if="stat.trendType === 'up'"><Top /></el-icon>
                <el-icon v-else-if="stat.trendType === 'down'"><Bottom /></el-icon>
                {{ stat.trend }}
              </p>
            </div>
            <div class="stat-icon" :style="{ background: stat.bgColor }">
              <el-icon :size="32" :color="stat.color">
                <component :is="stat.icon" />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">销售趋势</span>
              <el-radio-group v-model="chartTimeRange" size="small">
                <el-radio-button value="week">本周</el-radio-button>
                <el-radio-button value="month">本月</el-radio-button>
                <el-radio-button value="year">本年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="salesChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">销售分类</span>
            </div>
          </template>
          <div ref="categoryChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="bottom-row">
      <el-col :xs="24" :lg="12">
        <el-card class="activity-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">待办事项</span>
              <el-button type="primary" link @click="showAllTodos">查看全部</el-button>
            </div>
          </template>
          <div class="todo-list">
            <div v-for="todo in todos" :key="todo.id" class="todo-item">
              <el-checkbox v-model="todo.done" @change="handleTodoChange(todo)">
                <span :class="{ 'is-done': todo.done }">{{ todo.text }}</span>
              </el-checkbox>
              <el-tag :type="todo.priorityType" size="small">{{ todo.priority }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="activity-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">最近订单</span>
              <el-button type="primary" link @click="goToOrders">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentOrders" style="width: 100%" size="small">
            <el-table-column prop="orderNo" label="订单号" width="120" />
            <el-table-column prop="customer" label="客户" />
            <el-table-column prop="amount" label="金额" align="right">
              <template #default="{ row }">
                <span class="amount-text">¥{{ row.amount.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.statusType" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="quick-actions-row">
      <el-col :span="24">
        <el-card class="quick-actions-card">
          <template #header>
            <span class="card-title">快捷操作</span>
          </template>
          <div class="quick-actions">
            <div v-for="action in quickActions" :key="action.name" class="action-item" @click="handleAction(action)">
              <el-icon :size="28" :color="action.color">
                <component :is="action.icon" />
              </el-icon>
              <span>{{ action.name }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { 
  Money, ShoppingCart, Sell, User, Top, Bottom,
  Document, ShoppingBag, Goods, Tickets, Coin, Setting
} from '@element-plus/icons-vue'

const router = useRouter()
const chartTimeRange = ref('month')
const salesChartRef = ref(null)
const categoryChartRef = ref(null)
let salesChart = null
let categoryChart = null

const stats = reactive([
  {
    title: '今日销售额',
    value: '¥12,580',
    trend: '较昨日 +15.8%',
    trendType: 'up',
    icon: markRaw(Money),
    color: '#409EFF',
    bgColor: 'rgba(64, 158, 255, 0.1)'
  },
  {
    title: '今日订单',
    value: '86',
    trend: '较昨日 +5',
    trendType: 'up',
    icon: markRaw(ShoppingCart),
    color: '#67C23A',
    bgColor: 'rgba(103, 194, 58, 0.1)'
  },
  {
    title: '待收款',
    value: '¥45,230',
    trend: '较昨日 -2.3%',
    trendType: 'down',
    icon: markRaw(Coin),
    color: '#E6A23C',
    bgColor: 'rgba(230, 162, 60, 0.1)'
  },
  {
    title: '客户总数',
    value: '1,256',
    trend: '本月新增 +23',
    trendType: 'up',
    icon: markRaw(User),
    color: '#F56C6C',
    bgColor: 'rgba(245, 108, 108, 0.1)'
  }
])

const todos = reactive([
  { id: 1, text: '处理客户订单 #SO20240515001', done: false, priority: '紧急', priorityType: 'danger' },
  { id: 2, text: '跟进采购入库单 #PI20240514005', done: false, priority: '重要', priorityType: 'warning' },
  { id: 3, text: '核对本月财务报表', done: false, priority: '普通', priorityType: 'info' },
  { id: 4, text: '更新客户联系人信息', done: true, priority: '普通', priorityType: 'info' },
  { id: 5, text: '审核新员工权限申请', done: false, priority: '重要', priorityType: 'warning' }
])

const recentOrders = reactive([
  { orderNo: 'SO20240515012', customer: '深圳市科技有限公司', amount: 15800, status: '已出库', statusType: 'success' },
  { orderNo: 'SO20240515011', customer: '广州市软件企业', amount: 8500, status: '待发货', statusType: 'warning' },
  { orderNo: 'SO20240515010', customer: '东莞市网络公司', amount: 12000, status: '已完成', statusType: 'info' },
  { orderNo: 'SO20240515009', customer: '佛山市信息科技', amount: 6800, status: '已出库', statusType: 'success' },
  { orderNo: 'SO20240515008', customer: '惠州市电子集团', amount: 23500, status: '处理中', statusType: 'primary' }
])

const quickActions = reactive([
  { name: '新建销售单', icon: markRaw(Sell), color: '#409EFF', path: '/sales/order' },
  { name: '新建采购单', icon: markRaw(ShoppingBag), color: '#67C23A', path: '/purchase/order' },
  { name: '商品入库', icon: markRaw(Goods), color: '#E6A23C', path: '/purchase/inbound' },
  { name: '零售收银', icon: markRaw(Tickets), color: '#F56C6C', path: '/retail/order' },
  { name: '收款单', icon: markRaw(Coin), color: '#909399', path: '/finance/receipt' },
  { name: '系统设置', icon: markRaw(Setting), color: '#333333', path: '/system' }
])

const initSalesChart = () => {
  if (!salesChartRef.value) return
  
  salesChart = echarts.init(salesChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['销售额', '订单量'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月']
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额',
        axisLabel: { formatter: '¥{value}' }
      },
      {
        type: 'value',
        name: '订单量',
        axisLabel: { formatter: '{value}单' }
      }
    ],
    series: [
      {
        name: '销售额',
        type: 'bar',
        data: [32000, 45000, 38000, 52000, 48000, 63000, 58000],
        itemStyle: { color: '#409EFF' },
        barWidth: '30%'
      },
      {
        name: '订单量',
        type: 'line',
        yAxisIndex: 1,
        data: [120, 180, 150, 210, 190, 260, 230],
        smooth: true,
        itemStyle: { color: '#67C23A' },
        lineStyle: { width: 3 }
      }
    ]
  }
  salesChart.setOption(option)
}

const initCategoryChart = () => {
  if (!categoryChartRef.value) return
  
  categoryChart = echarts.init(categoryChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemWidth: 10,
      itemHeight: 10
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' }
        },
        data: [
          { value: 45, name: '企业软件', itemStyle: { color: '#409EFF' } },
          { value: 25, name: 'SaaS服务', itemStyle: { color: '#67C23A' } },
          { value: 15, name: '开发工具', itemStyle: { color: '#E6A23C' } },
          { value: 10, name: '运维服务', itemStyle: { color: '#F56C6C' } },
          { value: 5, name: '其他', itemStyle: { color: '#909399' } }
        ]
      }
    ]
  }
  categoryChart.setOption(option)
}

const handleResize = () => {
  salesChart?.resize()
  categoryChart?.resize()
}

const handleTodoChange = (todo) => {
  ElMessage.success(todo.done ? '已完成' : '已取消')
}

const showAllTodos = () => {
  ElMessage.info('待办事项列表开发中')
}

const goToOrders = () => {
  router.push('/sales/order')
}

const handleAction = (action) => {
  router.push(action.path)
}

onMounted(() => {
  setTimeout(() => {
    initSalesChart()
    initCategoryChart()
  }, 100)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  salesChart?.dispose()
  categoryChart?.dispose()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-info {
  flex: 1;
}

.stat-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #909399;
}

.stat-value {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stat-trend {
  margin: 0;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-trend.up {
  color: #67C23A;
}

.stat-trend.down {
  color: #F56C6C;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 8px;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.bottom-row {
  margin-bottom: 20px;
}

.activity-card {
  border-radius: 8px;
  height: 100%;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.todo-item:last-child {
  border-bottom: none;
}

.is-done {
  text-decoration: line-through;
  color: #909399;
}

.amount-text {
  font-weight: 500;
  color: #303133;
}

.quick-actions-row {
  margin-bottom: 20px;
}

.quick-actions-card {
  border-radius: 8px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

@media (max-width: 768px) {
  .quick-actions {
    grid-template-columns: repeat(3, 1fr);
  }
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border-radius: 8px;
  background: #f5f7fa;
  cursor: pointer;
  transition: all 0.3s;
}

.action-item:hover {
  background: #ecf5ff;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.action-item span {
  font-size: 14px;
  color: #606266;
}
</style>
