<template>
  <div class="purchase-page">
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">本月采购额</p>
              <p class="stat-value">¥{{ monthStats.purchaseAmount }}</p>
            </div>
            <div class="stat-icon purchase-icon">
              <el-icon :size="32"><ShoppingBag /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">待入库</p>
              <p class="stat-value">{{ monthStats.pendingInbounds }} 单</p>
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
              <p class="stat-label">本月退货</p>
              <p class="stat-value">¥{{ monthStats.returnAmount }}</p>
            </div>
            <div class="stat-icon return-icon">
              <el-icon :size="32"><RefreshLeft /></el-icon>
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
              <span class="card-title">采购管理</span>
              <div class="header-actions">
                <el-button type="primary" @click="handleNewOrder">
                  <el-icon><Plus /></el-icon>
                  新建采购单
                </el-button>
              </div>
            </div>
          </template>
          <div class="quick-actions">
            <div class="action-item" @click="goToOrder">
              <el-icon :size="40" color="#409EFF"><Document /></el-icon>
              <span>采购订单</span>
            </div>
            <div class="action-item" @click="goToInbound">
              <el-icon :size="40" color="#67C23A"><Box /></el-icon>
              <span>采购入库</span>
            </div>
            <div class="action-item" @click="goToReturn">
              <el-icon :size="40" color="#E6A23C"><RefreshLeft /></el-icon>
              <span>采购退货</span>
            </div>
            <div class="action-item" @click="showSupplierList">
              <el-icon :size="40" color="#909399"><OfficeBuilding /></el-icon>
              <span>供应商管理</span>
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
              <span class="card-title">待入库采购单</span>
              <el-button link @click="goToInbound">查看全部</el-button>
            </div>
          </template>
          <el-table :data="pendingOrders" stripe size="small">
            <el-table-column prop="orderNo" label="单号" width="160" />
            <el-table-column prop="supplierName" label="供应商" />
            <el-table-column prop="amount" label="金额" width="100" align="right">
              <template #default="{ row }">
                <span class="amount">¥{{ row.amount.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template #default="{ row }">
                <el-button link size="small" @click="handleInbound(row)">入库</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="12">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">最近采购单</span>
              <el-button link @click="goToOrder">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentOrders" stripe size="small">
            <el-table-column prop="orderNo" label="单号" width="160" />
            <el-table-column prop="supplierName" label="供应商" />
            <el-table-column prop="amount" label="金额" width="100" align="right">
              <template #default="{ row }">
                <span class="amount">¥{{ row.amount.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
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
import { ShoppingBag, Box, RefreshLeft, Plus, Document, OfficeBuilding } from '@element-plus/icons-vue'

const router = useRouter()

const monthStats = reactive({
  purchaseAmount: '156,800',
  pendingInbounds: 5,
  returnAmount: '12,300'
})

const pendingOrders = reactive([
  { orderNo: 'PO20240512001', supplierName: '微软(中国)有限公司', amount: 45000, status: '待入库' },
  { orderNo: 'PO20240513002', supplierName: 'Adobe公司', amount: 28000, status: '部分入库' },
  { orderNo: 'PO20240514003', supplierName: '金山软件股份', amount: 15800, status: '待入库' },
  { orderNo: 'PO20240514004', supplierName: '用友软件股份', amount: 35000, status: '待入库' },
  { orderNo: 'PO20240515005', supplierName: '联想集团', amount: 29999, status: '待入库' }
])

const recentOrders = reactive([
  { orderNo: 'PO20240515005', supplierName: '联想集团', amount: 29999, status: '待入库' },
  { orderNo: 'PO20240514004', supplierName: '用友软件股份', amount: 35000, status: '待入库' },
  { orderNo: 'PO20240513003', supplierName: '戴尔中国', amount: 18500, status: '已完成' },
  { orderNo: 'PO20240512002', supplierName: '罗技电子', amount: 8500, status: '已完成' },
  { orderNo: 'PO20240511001', supplierName: '惠普中国', amount: 22000, status: '已完成' }
])

const getStatusType = (status) => {
  const typeMap = {
    '已完成': 'success',
    '待入库': 'warning',
    '部分入库': 'info',
    '已退货': 'danger'
  }
  return typeMap[status] || ''
}

const goToOrder = () => router.push('/purchase/order')
const goToInbound = () => router.push('/purchase/inbound')
const goToReturn = () => router.push('/purchase/return')
const showSupplierList = () => router.push('/baseData/supplier')
const handleNewOrder = () => router.push('/purchase/order')

const handleInbound = (row) => {
  ElMessage.success(`正在处理入库: ${row.orderNo}`)
  router.push('/purchase/inbound')
}

const handleView = (row) => {
  ElMessage.info(`查看订单: ${row.orderNo}`)
}
</script>

<style scoped>
.purchase-page {
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

.purchase-icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
.pending-icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
.return-icon { background: linear-gradient(135deg, #E6A23C, #ebb563); }

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
