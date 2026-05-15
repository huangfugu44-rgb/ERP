<template>
  <div class="sales-outbound-page">
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">销售出库</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              新建出库单
            </el-button>
          </div>
        </div>
      </template>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="出库单号">
          <el-input v-model="searchForm.outboundNo" placeholder="请输入单号" clearable />
        </el-form-item>
        <el-form-item label="销售单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入销售单号" clearable />
        </el-form-item>
        <el-form-item label="出库日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="待出库" value="pending" />
            <el-option label="部分出库" value="partial" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="outboundList" stripe style="width: 100%">
        <el-table-column prop="outboundNo" label="出库单号" width="180" />
        <el-table-column prop="orderNo" label="销售单号" width="180">
          <template #default="{ row }">
            <el-button link @click="viewOrder(row)">{{ row.orderNo }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="outboundDate" label="出库日期" width="120" />
        <el-table-column prop="customerName" label="客户" />
        <el-table-column prop="warehouseName" label="出库仓库" width="120" />
        <el-table-column prop="productCount" label="商品种数" width="80" align="center" />
        <el-table-column prop="totalQuantity" label="出库数量" width="90" align="center" />
        <el-table-column prop="amount" label="出库金额" width="120" align="right">
          <template #default="{ row }">
            <span class="amount">¥{{ row.amount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="success" @click="handleOutbound(row)" v-if="row.status !== 'completed'">出库</el-button>
            <el-button link type="warning" @click="handlePrint(row)">打印</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <el-dialog v-model="formDialogVisible" title="新建出库单" width="900px" destroy-on-close>
      <el-form :model="outboundForm" :rules="outboundRules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="销售单号" prop="orderNo">
              <el-input v-model="outboundForm.orderNo" placeholder="请输入或扫描销售单号">
                <template #append>
                  <el-button @click="loadSalesOrder">加载</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出库日期" prop="outboundDate">
              <el-date-picker
                v-model="outboundForm.outboundDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户">
              <el-input v-model="outboundForm.customerName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出库仓库" prop="warehouseId">
              <el-select v-model="outboundForm.warehouseId" placeholder="请选择仓库" style="width: 100%">
                <el-option v-for="warehouse in warehouses" :key="warehouse.id" :label="warehouse.name" :value="warehouse.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="收货地址">
              <el-input v-model="outboundForm.address" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人">
              <el-input v-model="outboundForm.contact" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <el-divider>出库商品</el-divider>
      
      <el-table :data="outboundForm.items" size="small">
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="specification" label="规格" width="100" />
        <el-table-column prop="unit" label="单位" width="60" align="center" />
        <el-table-column prop="orderQuantity" label="订单数量" width="90" align="center" />
        <el-table-column prop="outboundQuantity" label="出库数量" width="120" align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.outboundQuantity" :min="0" :max="row.pendingQuantity" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="price" label="单价" width="100" align="right">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="100" align="right">
          <template #default="{ row }">¥{{ (row.price * row.outboundQuantity).toLocaleString() }}</template>
        </el-table-column>
      </el-table>
      
      <div class="outbound-summary">
        <span>出库总数量: {{ totalQuantity }} | </span>
        <span>出库总金额: <strong>¥{{ totalAmount.toLocaleString() }}</strong></span>
      </div>
      
      <el-form :model="outboundForm" label-width="100px" style="margin-top: 20px">
        <el-form-item label="备注">
          <el-input v-model="outboundForm.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认出库</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="出库单详情" width="900px" destroy-on-close>
      <el-descriptions :column="2" border v-if="currentOutbound">
        <el-descriptions-item label="出库单号">{{ currentOutbound.outboundNo }}</el-descriptions-item>
        <el-descriptions-item label="销售单号">{{ currentOutbound.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="出库日期">{{ currentOutbound.outboundDate }}</el-descriptions-item>
        <el-descriptions-item label="客户">{{ currentOutbound.customerName }}</el-descriptions-item>
        <el-descriptions-item label="出库仓库">{{ currentOutbound.warehouseName }}</el-descriptions-item>
        <el-descriptions-item label="出库人员">{{ currentOutbound.operator }}</el-descriptions-item>
        <el-descriptions-item label="出库数量">{{ currentOutbound.totalQuantity }}</el-descriptions-item>
        <el-descriptions-item label="出库金额">
          <strong style="color: #67C23A">¥{{ currentOutbound.amount.toLocaleString() }}</strong>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentOutbound.status)">{{ currentOutbound.statusText }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentOutbound.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <el-divider>出库商品明细</el-divider>
      
      <el-table :data="currentOutbound?.items || []" size="small">
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="specification" label="规格" width="100" />
        <el-table-column prop="unit" label="单位" width="60" align="center" />
        <el-table-column prop="outboundQuantity" label="出库数量" width="80" align="center" />
        <el-table-column prop="price" label="单价" width="100" align="right">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120" align="right">
          <template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template>
        </el-table-column>
      </el-table>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handlePrint">打印</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'

const searchForm = reactive({
  outboundNo: '',
  orderNo: '',
  dateRange: [],
  status: ''
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(4)
const formDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const formRef = ref(null)
const currentOutbound = ref(null)

const outboundForm = reactive({
  orderNo: '',
  customerName: '',
  warehouseId: '',
  outboundDate: new Date().toISOString().slice(0, 10),
  address: '',
  contact: '',
  items: [],
  remark: ''
})

const outboundRules = {
  orderNo: [{ required: true, message: '请输入销售单号', trigger: 'blur' }],
  outboundDate: [{ required: true, message: '请选择出库日期', trigger: 'change' }],
  warehouseId: [{ required: true, message: '请选择仓库', trigger: 'change' }]
}

const warehouses = reactive([
  { id: 1, name: '主仓库' },
  { id: 2, name: '软件仓库' },
  { id: 3, name: '硬件仓库' }
])

const outboundList = reactive([
  { outboundNo: 'SOUT20240515001', orderNo: 'SO20240514001', outboundDate: '2024-05-15', customerName: '深圳市科技有限公司', warehouseName: '软件仓库', productCount: 2, totalQuantity: 50, amount: 45000, status: 'completed', statusText: '已完成', operator: '张三', items: [] },
  { outboundNo: 'SOUT20240514002', orderNo: 'SO20240513002', outboundDate: '2024-05-14', customerName: '广州市软件企业', warehouseName: '软件仓库', productCount: 1, totalQuantity: 20, amount: 28000, status: 'completed', statusText: '已完成', operator: '李四', items: [] },
  { outboundNo: 'SOUT20240513003', orderNo: 'SO20240512003', outboundDate: '2024-05-13', customerName: '东莞市网络公司', warehouseName: '软件仓库', productCount: 3, totalQuantity: 100, amount: 15800, status: 'completed', statusText: '已完成', operator: '王五', items: [] },
  { outboundNo: 'SOUT20240512004', orderNo: 'SO20240511004', outboundDate: '2024-05-12', customerName: '佛山市信息科技', warehouseName: '软件仓库', productCount: 2, totalQuantity: 30, amount: 35000, status: 'partial', statusText: '部分出库', operator: '张三', items: [] }
])

const totalQuantity = computed(() => {
  return outboundForm.items.reduce((sum, item) => sum + item.outboundQuantity, 0)
})

const totalAmount = computed(() => {
  return outboundForm.items.reduce((sum, item) => sum + item.price * item.outboundQuantity, 0)
})

const getStatusType = (status) => {
  const typeMap = { pending: 'warning', partial: 'info', completed: 'success' }
  return typeMap[status] || ''
}

const handleSearch = () => ElMessage.success('查询成功')
const handleReset = () => {
  searchForm.outboundNo = ''
  searchForm.orderNo = ''
  searchForm.dateRange = []
  searchForm.status = ''
}

const handleCreate = () => {
  outboundForm.orderNo = ''
  outboundForm.customerName = ''
  outboundForm.warehouseId = ''
  outboundForm.address = ''
  outboundForm.contact = ''
  outboundForm.items = []
  outboundForm.remark = ''
  formDialogVisible.value = true
}

const handleView = (row) => {
  currentOutbound.value = row
  detailDialogVisible.value = true
}

const handleOutbound = (row) => {
  currentOutbound.value = row
  outboundForm.orderNo = row.orderNo
  outboundForm.customerName = row.customerName
  outboundForm.items = row.items.map(item => ({
    ...item,
    outboundQuantity: item.orderQuantity - item.outboundedQuantity
  }))
  formDialogVisible.value = true
}

const loadSalesOrder = () => {
  if (!outboundForm.orderNo) {
    ElMessage.warning('请输入销售单号')
    return
  }
  outboundForm.customerName = '深圳市科技有限公司'
  outboundForm.address = '深圳市南山区科技园'
  outboundForm.items = [
    { productName: 'Office 365 商业版', specification: '年订阅', unit: '套', orderQuantity: 30, outboundQuantity: 25, pendingQuantity: 5, price: 2199 },
    { productName: 'Microsoft 365 E3', specification: '年订阅', unit: '套', orderQuantity: 20, outboundQuantity: 20, pendingQuantity: 0, price: 1500 }
  ]
  ElMessage.success('已加载销售单商品')
}

const viewOrder = (row) => ElMessage.info(`查看销售单: ${row.orderNo}`)
const handlePrint = (row) => ElMessage.success('正在打印...')

const handleSubmit = () => {
  if (!outboundForm.warehouseId) {
    ElMessage.warning('请选择仓库')
    return
  }
  const hasOutbound = outboundForm.items.some(item => item.outboundQuantity > 0)
  if (!hasOutbound) {
    ElMessage.warning('请输入出库数量')
    return
  }
  ElMessageBox.confirm(`确认出库，总数量 ${totalQuantity.value}，总金额 ¥${totalAmount.value.toLocaleString()}?`, '确认出库', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('出库成功')
    formDialogVisible.value = false
  }).catch(() => {})
}
</script>

<style scoped>
.sales-outbound-page {
  padding: 0;
}

.search-card, .table-card {
  border-radius: 8px;
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

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.amount {
  font-weight: 500;
}

.outbound-summary {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
  text-align: right;
  font-size: 14px;
  margin-top: 15px;
}

.outbound-summary strong {
  color: #67C23A;
  font-size: 16px;
}
</style>
