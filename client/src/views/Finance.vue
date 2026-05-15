<template>
  <div class="finance-page">
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">本月应收</p>
              <p class="stat-value">¥{{ monthStats.receivable }}</p>
            </div>
            <div class="stat-icon receivable-icon">
              <el-icon :size="32"><TrendCharts /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">本月实收</p>
              <p class="stat-value">¥{{ monthStats.received }}</p>
            </div>
            <div class="stat-icon received-icon">
              <el-icon :size="32"><Money /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">本月应付</p>
              <p class="stat-value">¥{{ monthStats.payable }}</p>
            </div>
            <div class="stat-icon payable-icon">
              <el-icon :size="32"><Wallet /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">本月实付</p>
              <p class="stat-value">¥{{ monthStats.paid }}</p>
            </div>
            <div class="stat-icon paid-icon">
              <el-icon :size="32"><Coin /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">应收账款</p>
              <p class="stat-value">¥{{ monthStats.accountsReceivable }}</p>
            </div>
            <div class="stat-icon ar-icon">
              <el-icon :size="32"><User /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">应付账款</p>
              <p class="stat-value">¥{{ monthStats.accountsPayable }}</p>
            </div>
            <div class="stat-icon ap-icon">
              <el-icon :size="32"><OfficeBuilding /></el-icon>
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
              <span class="card-title">财务管理</span>
            </div>
          </template>
          <div class="quick-actions">
            <div class="action-item" @click="goToReceipt">
              <el-icon :size="40" color="#67C23A"><Plus /></el-icon>
              <span>收款单</span>
            </div>
            <div class="action-item" @click="goToPayment">
              <el-icon :size="40" color="#E6A23C"><Minus /></el-icon>
              <span>付款单</span>
            </div>
            <div class="action-item" @click="showAccountList">
              <el-icon :size="40" color="#409EFF"><Wallet /></el-icon>
              <span>账户管理</span>
            </div>
            <div class="action-item" @click="showInvoiceList">
              <el-icon :size="40" color="#909399"><Document /></el-icon>
              <span>收票记录</span>
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
              <span class="card-title">待收款提醒</span>
              <el-button link @click="goToReceipt">查看全部</el-button>
            </div>
          </template>
          <el-table :data="pendingReceipts" stripe size="small">
            <el-table-column prop="customerName" label="客户" />
            <el-table-column prop="orderNo" label="订单号" width="150" />
            <el-table-column prop="amount" label="应收金额" width="100" align="right">
              <template #default="{ row }">
                <span class="amount">¥{{ row.amount.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="dueDate" label="到期日" width="100" align="center" />
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ row }">
                <el-button link size="small" @click="handleReceipt(row)">收款</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="12">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">待付款提醒</span>
              <el-button link @click="goToPayment">查看全部</el-button>
            </div>
          </template>
          <el-table :data="pendingPayments" stripe size="small">
            <el-table-column prop="supplierName" label="供应商" />
            <el-table-column prop="orderNo" label="单号" width="150" />
            <el-table-column prop="amount" label="应付金额" width="100" align="right">
              <template #default="{ row }">
                <span class="amount">¥{{ row.amount.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="dueDate" label="到期日" width="100" align="center" />
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ row }">
                <el-button link size="small" @click="handlePayment(row)">付款</el-button>
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
import { TrendCharts, Money, Wallet, Coin, User, OfficeBuilding, Plus, Minus, Document } from '@element-plus/icons-vue'

const router = useRouter()

const monthStats = reactive({
  receivable: '568,000',
  received: '423,500',
  payable: '156,800',
  paid: '98,500',
  accountsReceivable: '892,000',
  accountsPayable: '156,800'
})

const pendingReceipts = reactive([
  { customerName: '深圳市科技有限公司', orderNo: 'SO20240515001', amount: 58000, dueDate: '2024-05-20' },
  { customerName: '广州市软件企业', orderNo: 'SO20240515002', amount: 32000, dueDate: '2024-05-22' },
  { customerName: '东莞市网络公司', orderNo: 'SO20240514003', amount: 18500, dueDate: '2024-05-25' },
  { customerName: '佛山市信息科技', orderNo: 'SO20240514004', amount: 45000, dueDate: '2024-05-28' },
  { customerName: '惠州市电子集团', orderNo: 'SO20240513005', amount: 68000, dueDate: '2024-05-30' }
])

const pendingPayments = reactive([
  { supplierName: '微软(中国)有限公司', orderNo: 'PO20240512001', amount: 45000, dueDate: '2024-05-18' },
  { supplierName: 'Adobe公司', orderNo: 'PO20240513002', amount: 28000, dueDate: '2024-05-20' },
  { supplierName: '金山软件股份', orderNo: 'PO20240514003', amount: 15800, dueDate: '2024-05-22' },
  { supplierName: '用友软件股份', orderNo: 'PO20240514004', amount: 35000, dueDate: '2024-05-25' },
  { supplierName: '联想集团', orderNo: 'PO20240515005', amount: 29999, dueDate: '2024-05-28' }
])

const goToReceipt = () => router.push('/finance/receipt')
const goToPayment = () => router.push('/finance/payment')
const showAccountList = () => router.push('/baseData/account')
const showInvoiceList = () => ElMessage.info('收票记录功能开发中')

const handleReceipt = (row) => {
  ElMessage.success(`正在处理收款: ${row.customerName}`)
  router.push('/finance/receipt')
}

const handlePayment = (row) => {
  ElMessage.success(`正在处理付款: ${row.supplierName}`)
  router.push('/finance/payment')
}
</script>

<style scoped>
.finance-page {
  padding: 0;
}

.stats-row {
  margin-bottom: 0;
}

.stat-card {
  border-radius: 8px;
  margin-bottom: 20px;
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

.receivable-icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
.received-icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
.payable-icon { background: linear-gradient(135deg, #E6A23C, #ebb563); }
.paid-icon { background: linear-gradient(135deg, #F56C6C, #f78989); }
.ar-icon { background: linear-gradient(135deg, #909399, #a6a9ad); }
.ap-icon { background: linear-gradient(135deg, #8e44ad, #9b59b6); }

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
