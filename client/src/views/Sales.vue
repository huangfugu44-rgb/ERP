<template>
  <div class="sales-page">
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">本月销售额</p>
              <p class="stat-value">¥{{ monthStats.salesAmount }}</p>
            </div>
            <div class="stat-icon sales-icon">
              <el-icon :size="32"><Money /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">待出库</p>
              <p class="stat-value">{{ monthStats.pendingOutbounds }} 单</p>
            </div>
            <div class="stat-icon pending-icon">
              <el-icon :size="32"><Box /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">本月回款</p>
              <p class="stat-value">¥{{ monthStats.receiptAmount }}</p>
            </div>
            <div class="stat-icon receipt-icon">
              <el-icon :size="32"><TrendCharts /></el-icon>
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
              <span class="card-title">销售管理</span>
              <div class="header-actions">
                <el-button type="primary" @click="handleNewOrder">
                  <el-icon><Plus /></el-icon>
                  新建销售单
                </el-button>
              </div>
            </div>
          </template>
          <div class="quick-actions">
            <div class="action-item" @click="goToOrder">
              <el-icon :size="40" color="#409EFF"><Document /></el-icon>
              <span>销售订单</span>
            </div>
            <div class="action-item" @click="goToOutbound">
              <el-icon :size="40" color="#67C23A"><Van /></el-icon>
              <span>销售出库</span>
            </div>
            <div class="action-item" @click="goToReturn">
              <el-icon :size="40" color="#E6A23C"><RefreshLeft /></el-icon>
              <span>销售退货</span>
            </div>
            <div class="action-item" @click="showCustomerList">
              <el-icon :size="40" color="#909399"><OfficeBuilding /></el-icon>
              <span>客户管理</span>
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
              <span class="card-title">待出库销售单</span>
              <el-button link @click="goToOutbound">查看全部</el-button>
            </div>
          </template>
          <el-table :data="pendingOrders" stripe size="small">
            <el-table-column prop="orderNo" label="单号" width="160" />
            <el-table-column prop="customerName" label="客户" />
            <el-table-column prop="amount" label="金额" width="100" align="right">
              <template #default="{ row }">
                <span class="amount">¥{{ row.amount.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">{{ row.statusText }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template #default="{ row }">
                <el-button link size="small" @click="handleOutbound(row)">出库</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="12">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">最近销售单</span>
              <el-button link @click="goToOrder">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentOrders" stripe size="small">
            <el-table-column prop="orderNo" label="单号" width="160" />
            <el-table-column prop="customerName" label="客户" />
            <el-table-column prop="amount" label="金额" width="100" align="right">
              <template #default="{ row }">
                <span class="amount">¥{{ row.amount.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">{{ row.statusText }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ row }">
                <el-button link size="small" @click="handleView(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Money, Box, TrendCharts, Plus, Document, Van, RefreshLeft, OfficeBuilding } from '@element-plus/icons-vue'

const router = useRouter()

const monthStats = reactive({
  salesAmount: '568,000',
  pendingOutbounds: 8,
  receiptAmount: '423,500'
})

const pendingOrders = reactive([
  { orderNo: 'SO20240515001', customerName: '深圳市科技有限公司', amount: 58000, status: 'approved', statusText: '待出库' },
  { orderNo: 'SO20240515002', customerName: '广州市软件企业', amount: 32000, status: 'approved', statusText: '待出库' },
  { orderNo: 'SO20240514003', customerName: '东莞市网络公司', amount: 18500, status: 'partial', statusText: '部分出库' },
  { orderNo: 'SO20240514004', customerName: '佛山市信息科技', amount: 45000, status: 'approved', statusText: '待出库' },
  { orderNo: 'SO20240513005', customerName: '惠州市电子集团', amount: 68000, status: 'approved', statusText: '待出库' }
])

const recentOrders = reactive([
  { orderNo: 'SO20240515005', customerName: '惠州市电子集团', amount: 68000, status: 'approved', statusText: '待出库' },
  { orderNo: 'SO20240514004', customerName: '佛山市信息科技', amount: 45000, status: 'approved', statusText: '待出库' },
  { orderNo: 'SO20240513003', customerName: '东莞市网络公司', amount: 18500, status: 'partial', statusText: '部分出库' },
  { orderNo: 'SO20240512002', customerName: '珠海市科技公司', amount: 28000, status: 'completed', statusText: '已完成' },
  { orderNo: 'SO20240511001', customerName: '中山市软件企业', amount: 35000, status: 'completed', statusText: '已完成' }
])

const getStatusType = (status) => {
  const typeMap = {
    'approved': 'warning',
    'partial': 'info',
    'completed': 'success',
    'returned': 'danger'
  }
  return typeMap[status] || ''
}

const goToOrder = () => router.push('/sales/order')
const goToOutbound = () => router.push('/sales/outbound')
const goToReturn = () => router.push('/sales/return')
const showCustomerList = () => router.push('/baseData/customer')
const handleNewOrder = () => router.push('/sales/order')

const handleOutbound = (row) => {
  ElMessage.success(`正在处理出库: ${row.orderNo}`)
  router.push('/sales/outbound')
}

const handleView = (row) => {
  ElMessage.info(`查看订单: ${row.orderNo}`)
}
</script>

<style scoped>
.sales-page {
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

.sales-icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
.pending-icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
.receipt-icon { background: linear-gradient(135deg, #E6A23C, #ebb563); }

.main-content {
  margin-bottom: 20px;
}

.action-card, .table-card {
  border-radius: 8px;
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

.amount {
  font-weight: 500;
}
</style>
