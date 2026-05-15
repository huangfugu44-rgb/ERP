<template>
  <div class="retail-page">
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">今日销售额</p>
              <p class="stat-value">¥{{ todayStats.sales }}</p>
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
              <p class="stat-label">今日订单数</p>
              <p class="stat-value">{{ todayStats.orders }}</p>
            </div>
            <div class="stat-icon order-icon">
              <el-icon :size="32"><Tickets /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">今日毛利</p>
              <p class="stat-value">¥{{ todayStats.profit }}</p>
            </div>
            <div class="stat-icon profit-icon">
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
              <span class="card-title">零售收银</span>
              <div class="header-actions">
                <el-button type="primary" @click="handleNewOrder">
                  <el-icon><Plus /></el-icon>
                  新建零售单
                </el-button>
              </div>
            </div>
          </template>
          <div class="quick-actions">
            <div class="action-item" @click="goToOrder">
              <el-icon :size="40" color="#409EFF"><Sell /></el-icon>
              <span>零售收银</span>
            </div>
            <div class="action-item" @click="goToReturn">
              <el-icon :size="40" color="#E6A23C"><RefreshLeft /></el-icon>
              <span>零售退货</span>
            </div>
            <div class="action-item" @click="showDailyReport">
              <el-icon :size="40" color="#67C23A"><DataAnalysis /></el-icon>
              <span>日结报表</span>
            </div>
            <div class="action-item" @click="showOrderList">
              <el-icon :size="40" color="#909399"><Document /></el-icon>
              <span>订单查询</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="table-row">
      <el-col :span="24">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">今日零售单</span>
              <el-input
                v-model="searchKeyword"
                placeholder="搜索订单号/客户"
                style="width: 250px"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </template>
          <el-table :data="filteredOrders" stripe style="width: 100%">
            <el-table-column prop="orderNo" label="单据编号" width="180" />
            <el-table-column prop="createTime" label="单据时间" width="160" />
            <el-table-column prop="customerName" label="客户名称" />
            <el-table-column prop="productCount" label="商品数量" width="100" align="center" />
            <el-table-column prop="totalAmount" label="单据金额" width="120" align="right">
              <template #default="{ row }">
                <span class="amount">¥{{ row.totalAmount.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="discountAmount" label="折扣金额" width="100" align="right">
              <template #default="{ row }">
                <span class="discount">-¥{{ row.discountAmount.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="actualAmount" label="实际金额" width="120" align="right">
              <template #default="{ row }">
                <span class="actual-amount">¥{{ row.actualAmount.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="paymentMethod" label="支付方式" width="100" align="center">
              <template #default="{ row }">
                <el-tag size="small">{{ row.paymentMethod }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleView(row)">查看</el-button>
                <el-button link type="primary" @click="handlePrint(row)">打印</el-button>
                <el-button link type="danger" @click="handleRefund(row)">退款</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="orderDialogVisible" title="零售单详情" width="800px" destroy-on-close>
      <el-descriptions :column="2" border v-if="currentOrder">
        <el-descriptions-item label="单据编号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="单据时间">{{ currentOrder.createTime }}</el-descriptions-item>
        <el-descriptions-item label="客户名称">{{ currentOrder.customerName }}</el-descriptions-item>
        <el-descriptions-item label="销售人员">{{ currentOrder.salesperson }}</el-descriptions-item>
        <el-descriptions-item label="单据金额">¥{{ currentOrder.totalAmount.toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="折扣金额">-¥{{ currentOrder.discountAmount.toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="实际金额" :span="2">
          <strong style="color: #F56C6C; font-size: 18px">¥{{ currentOrder.actualAmount.toLocaleString() }}</strong>
        </el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ currentOrder.paymentMethod }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentOrder.status)">{{ currentOrder.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentOrder.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      <el-divider>商品明细</el-divider>
      <el-table :data="currentOrder?.items || []" size="small">
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="specification" label="规格" width="120" />
        <el-table-column prop="unit" label="单位" width="60" align="center" />
        <el-table-column prop="quantity" label="数量" width="80" align="center" />
        <el-table-column prop="price" label="单价" width="100" align="right">
          <template #default="{ row }">¥{{ row.price.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="100" align="right">
          <template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="orderDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handlePrint">打印小票</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Money, Tickets, TrendCharts, Plus, Sell, RefreshLeft, DataAnalysis, Document, Search } from '@element-plus/icons-vue'

const router = useRouter()
const searchKeyword = ref('')
const orderDialogVisible = ref(false)
const currentOrder = ref(null)

const todayStats = reactive({
  sales: '8,560',
  orders: '42',
  profit: '1,280'
})

const orders = reactive([
  { orderNo: 'RO20240515001', createTime: '2024-05-15 09:30', customerName: '散客', salesperson: '张三', productCount: 3, totalAmount: 1580, discountAmount: 80, actualAmount: 1500, paymentMethod: '微信支付', status: '已完成', items: [] },
  { orderNo: 'RO20240515002', createTime: '2024-05-15 10:15', customerName: '散客', salesperson: '李四', productCount: 2, totalAmount: 560, discountAmount: 0, actualAmount: 560, paymentMethod: '支付宝', status: '已完成', items: [] },
  { orderNo: 'RO20240515003', createTime: '2024-05-15 11:20', customerName: '深圳市科技有限公司', salesperson: '张三', productCount: 5, totalAmount: 3200, discountAmount: 200, actualAmount: 3000, paymentMethod: '银行转账', status: '已完成', items: [] },
  { orderNo: 'RO20240515004', createTime: '2024-05-15 14:30', customerName: '散客', salesperson: '王五', productCount: 1, totalAmount: 299, discountAmount: 0, actualAmount: 299, paymentMethod: '现金', status: '已完成', items: [] },
  { orderNo: 'RO20240515005', createTime: '2024-05-15 15:45', customerName: '广州市软件企业', salesperson: '李四', productCount: 4, totalAmount: 4500, discountAmount: 500, actualAmount: 4000, paymentMethod: '微信支付', status: '已完成', items: [] }
])

const filteredOrders = computed(() => {
  if (!searchKeyword.value) return orders
  const keyword = searchKeyword.value.toLowerCase()
  return orders.filter(order => 
    order.orderNo.toLowerCase().includes(keyword) || 
    order.customerName.toLowerCase().includes(keyword)
  )
})

const getStatusType = (status) => {
  const typeMap = {
    '已完成': 'success',
    '进行中': 'warning',
    '已取消': 'info',
    '已退款': 'danger'
  }
  return typeMap[status] || ''
}

const goToOrder = () => router.push('/retail/order')
const goToReturn = () => router.push('/retail/return')

const handleNewOrder = () => router.push('/retail/order')

const showDailyReport = () => ElMessage.info('日结报表功能开发中')
const showOrderList = () => ElMessage.info('订单查询功能开发中')

const handleView = (row) => {
  currentOrder.value = row
  orderDialogVisible.value = true
}

const handlePrint = (row) => {
  ElMessage.success('正在打印小票...')
}

const handleRefund = (row) => {
  ElMessageBox.confirm(`确定要退款订单 ${row.orderNo} 吗?`, '退款确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = '已退款'
    ElMessage.success('退款成功')
  }).catch(() => {})
}
</script>

<style scoped>
.retail-page {
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
.order-icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
.profit-icon { background: linear-gradient(135deg, #E6A23C, #ebb563); }

.main-content {
  margin-bottom: 20px;
}

.action-card {
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

.header-actions {
  display: flex;
  gap: 10px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 20px 0;
}

@media (max-width: 768px) {
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
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

.table-row {
  margin-bottom: 20px;
}

.table-card {
  border-radius: 8px;
}

.amount {
  font-weight: 500;
}

.discount {
  color: #67C23A;
}

.actual-amount {
  font-weight: 600;
  color: #F56C6C;
}
</style>
