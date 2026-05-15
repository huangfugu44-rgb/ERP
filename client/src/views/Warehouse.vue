<template>
  <div class="warehouse-page">
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">商品种类</p>
              <p class="stat-value">{{ stats.productTypes }}</p>
            </div>
            <div class="stat-icon type-icon">
              <el-icon :size="32"><Goods /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">库存商品总数量</p>
              <p class="stat-value">{{ stats.totalQuantity }}</p>
            </div>
            <div class="stat-icon quantity-icon">
              <el-icon :size="32"><Box /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">库存金额</p>
              <p class="stat-value">¥{{ stats.inventoryAmount }}</p>
            </div>
            <div class="stat-icon amount-icon">
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
              <span class="card-title">仓库管理</span>
            </div>
          </template>
          <div class="quick-actions">
            <div class="action-item" @click="goToInventory">
              <el-icon :size="40" color="#409EFF"><Search /></el-icon>
              <span>库存查询</span>
            </div>
            <div class="action-item" @click="showWarehouseList">
              <el-icon :size="40" color="#67C23A"><OfficeBuilding /></el-icon>
              <span>仓库设置</span>
            </div>
            <div class="action-item" @click="showStockTransfer">
              <el-icon :size="40" color="#E6A23C"><Refresh /></el-icon>
              <span>库存调拨</span>
            </div>
            <div class="action-item" @click="showStockCheck">
              <el-icon :size="40" color="#909399"><Document /></el-icon>
              <span>库存盘点</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xs="24" :lg="12">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">库存预警</span>
              <el-button link @click="showAllWarnings">查看全部</el-button>
            </div>
          </template>
          <el-table :data="warnings" stripe size="small">
            <el-table-column prop="productName" label="商品名称" />
            <el-table-column prop="warehouseName" label="仓库" width="100" />
            <el-table-column prop="currentStock" label="当前库存" width="90" align="center">
              <template #default="{ row }">
                <span :class="{ 'low-stock': row.currentStock <= row.minStock }">{{ row.currentStock }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="minStock" label="最低库存" width="90" align="center" />
            <el-table-column prop="status" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.currentStock <= row.minStock ? 'danger' : 'warning'" size="small">
                  {{ row.currentStock <= row.minStock ? '不足' : '偏低' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="12">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">各仓库库存分布</span>
            </div>
          </template>
          <div ref="warehouseChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="bottom-row">
      <el-col :span="24">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">库存异动记录</span>
              <el-input
                v-model="searchKeyword"
                placeholder="搜索商品名称"
                style="width: 250px"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </template>
          <el-table :data="stockRecords" stripe size="small">
            <el-table-column prop="recordDate" label="日期" width="120" />
            <el-table-column prop="productName" label="商品名称" />
            <el-table-column prop="warehouseName" label="仓库" width="120" />
            <el-table-column prop="changeType" label="异动类型" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getChangeType(row.changeType)" size="small">{{ row.changeTypeText }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="changeQuantity" label="数量变化" width="100" align="center">
              <template #default="{ row }">
                <span :class="row.changeQuantity > 0 ? 'positive' : 'negative'">
                  {{ row.changeQuantity > 0 ? '+' : '' }}{{ row.changeQuantity }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="beforeStock" label="变动前" width="80" align="center" />
            <el-table-column prop="afterStock" label="变动后" width="80" align="center" />
            <el-table-column prop="remark" label="备注" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { Goods, Box, Money, Search, OfficeBuilding, Refresh, Document } from '@element-plus/icons-vue'

const router = useRouter()
const searchKeyword = ref('')
const warehouseChartRef = ref(null)
let warehouseChart = null

const stats = reactive({
  productTypes: 156,
  totalQuantity: 2850,
  inventoryAmount: '2,568,000'
})

const warnings = reactive([
  { productName: 'Office 365 商业版', warehouseName: '软件仓库', currentStock: 5, minStock: 10 },
  { productName: 'Adobe Creative Cloud', warehouseName: '软件仓库', currentStock: 8, minStock: 15 },
  { productName: 'ThinkPad笔记本', warehouseName: '硬件仓库', currentStock: 3, minStock: 5 },
  { productName: 'Dell显示器27寸', warehouseName: '硬件仓库', currentStock: 12, minStock: 20 }
])

const stockRecords = reactive([
  { recordDate: '2024-05-15', productName: 'Office 365 商业版', warehouseName: '软件仓库', changeType: 'inbound', changeTypeText: '采购入库', changeQuantity: 50, beforeStock: 20, afterStock: 70, remark: 'PO20240515001' },
  { recordDate: '2024-05-15', productName: 'Adobe Creative Cloud', warehouseName: '软件仓库', changeType: 'outbound', changeTypeText: '销售出库', changeQuantity: -10, beforeStock: 35, afterStock: 25, remark: 'SO20240515001' },
  { recordDate: '2024-05-14', productName: '金山文档企业版', warehouseName: '软件仓库', changeType: 'return', changeTypeText: '零售退货', changeQuantity: 5, beforeStock: 45, afterStock: 50, remark: 'RO20240514003' },
  { recordDate: '2024-05-14', productName: 'ThinkPad笔记本', warehouseName: '硬件仓库', changeType: 'outbound', changeTypeText: '销售出库', changeQuantity: -8, beforeStock: 15, afterStock: 7, remark: 'SO20240514005' },
  { recordDate: '2024-05-13', productName: '用友U8软件', warehouseName: '软件仓库', changeType: 'adjust', changeTypeText: '库存调整', changeQuantity: -2, beforeStock: 25, afterStock: 23, remark: '盘点调整' }
])

const getChangeType = (type) => {
  const typeMap = {
    inbound: 'success',
    outbound: 'warning',
    return: 'info',
    adjust: ''
  }
  return typeMap[type] || ''
}

const initWarehouseChart = () => {
  if (!warehouseChartRef.value) return
  
  warehouseChart = echarts.init(warehouseChartRef.value)
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
          { value: 45, name: '软件仓库', itemStyle: { color: '#409EFF' } },
          { value: 30, name: '硬件仓库', itemStyle: { color: '#67C23A' } },
          { value: 15, name: '主仓库', itemStyle: { color: '#E6A23C' } },
          { value: 10, name: '其他', itemStyle: { color: '#909399' } }
        ]
      }
    ]
  }
  warehouseChart.setOption(option)
}

const handleResize = () => {
  warehouseChart?.resize()
}

const goToInventory = () => router.push('/warehouse/inventory')
const showWarehouseList = () => {
  ElMessage.info('仓库设置功能开发中')
}
const showStockTransfer = () => {
  ElMessage.info('库存调拨功能开发中')
}
const showStockCheck = () => {
  ElMessage.info('库存盘点功能开发中')
}
const showAllWarnings = () => {
  ElMessage.info('查看全部预警功能开发中')
}

onMounted(() => {
  setTimeout(() => {
    initWarehouseChart()
  }, 100)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  warehouseChart?.dispose()
})
</script>

<style scoped>
.warehouse-page {
  padding: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #909399;
}

.stat-value {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.type-icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
.quantity-icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
.amount-icon { background: linear-gradient(135deg, #E6A23C, #ebb563); }

.main-content {
  margin-bottom: 20px;
}

.action-card, .table-card {
  border-radius: 8px;
}

.bottom-row {
  margin-bottom: 20px;
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

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 20px 0;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 30px 20px;
  background: #f5f7fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-item:hover {
  background: #ecf5ff;
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.action-item span {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

.low-stock {
  color: #F56C6C;
  font-weight: 600;
}

.positive {
  color: #67C23A;
  font-weight: 600;
}

.negative {
  color: #F56C6C;
  font-weight: 600;
}

.chart-container {
  height: 250px;
  width: 100%;
}
</style>
