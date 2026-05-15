<template>
  <div class="purchase-inbound-page">
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">采购入库</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              新建入库单
            </el-button>
          </div>
        </div>
      </template>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="入库单号">
          <el-input v-model="searchForm.inboundNo" placeholder="请输入单号" clearable />
        </el-form-item>
        <el-form-item label="采购单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入采购单号" clearable />
        </el-form-item>
        <el-form-item label="入库日期">
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
            <el-option label="待入库" value="pending" />
            <el-option label="部分入库" value="partial" />
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
      <el-table :data="inboundList" stripe style="width: 100%">
        <el-table-column prop="inboundNo" label="入库单号" width="180" />
        <el-table-column prop="orderNo" label="采购单号" width="180">
          <template #default="{ row }">
            <el-button link @click="viewOrder(row)">{{ row.orderNo }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="inboundDate" label="入库日期" width="120" />
        <el-table-column prop="supplierName" label="供应商" />
        <el-table-column prop="warehouseName" label="入库仓库" width="120" />
        <el-table-column prop="productCount" label="商品种数" width="80" align="center" />
        <el-table-column prop="totalQuantity" label="入库数量" width="90" align="center" />
        <el-table-column prop="amount" label="入库金额" width="120" align="right">
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
            <el-button link type="success" @click="handleInbound(row)" v-if="row.status !== 'completed'">入库</el-button>
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

    <el-dialog v-model="formDialogVisible" title="新建入库单" width="900px" destroy-on-close>
      <el-form :model="inboundForm" :rules="inboundRules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="采购单号" prop="orderNo">
              <el-input v-model="inboundForm.orderNo" placeholder="请输入或扫描采购单号">
                <template #append>
                  <el-button @click="loadPurchaseOrder">加载</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入库日期" prop="inboundDate">
              <el-date-picker
                v-model="inboundForm.inboundDate"
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
            <el-form-item label="供应商">
              <el-input v-model="inboundForm.supplierName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入库仓库" prop="warehouseId">
              <el-select v-model="inboundForm.warehouseId" placeholder="请选择仓库" style="width: 100%">
                <el-option v-for="warehouse in warehouses" :key="warehouse.id" :label="warehouse.name" :value="warehouse.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <el-divider>入库商品</el-divider>
      
      <el-table :data="inboundForm.items" size="small">
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="specification" label="规格" width="100" />
        <el-table-column prop="unit" label="单位" width="60" align="center" />
        <el-table-column prop="orderQuantity" label="订单数量" width="90" align="center" />
        <el-table-column prop="inboundQuantity" label="入库数量" width="120" align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.inboundQuantity" :min="0" :max="row.orderQuantity - row.inboundedQuantity" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="price" label="单价" width="100" align="right">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="100" align="right">
          <template #default="{ row }">¥{{ (row.price * row.inboundQuantity).toLocaleString() }}</template>
        </el-table-column>
      </el-table>
      
      <div class="inbound-summary">
        <span>入库总数量: {{ totalQuantity }} | </span>
        <span>入库总金额: <strong>¥{{ totalAmount.toLocaleString() }}</strong></span>
      </div>
      
      <el-form :model="inboundForm" label-width="100px" style="margin-top: 20px">
        <el-form-item label="备注">
          <el-input v-model="inboundForm.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认入库</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="入库单详情" width="900px" destroy-on-close>
      <el-descriptions :column="2" border v-if="currentInbound">
        <el-descriptions-item label="入库单号">{{ currentInbound.inboundNo }}</el-descriptions-item>
        <el-descriptions-item label="采购单号">{{ currentInbound.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="入库日期">{{ currentInbound.inboundDate }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ currentInbound.supplierName }}</el-descriptions-item>
        <el-descriptions-item label="入库仓库">{{ currentInbound.warehouseName }}</el-descriptions-item>
        <el-descriptions-item label="入库人员">{{ currentInbound.operator }}</el-descriptions-item>
        <el-descriptions-item label="入库数量">{{ currentInbound.totalQuantity }}</el-descriptions-item>
        <el-descriptions-item label="入库金额">
          <strong style="color: #67C23A">¥{{ currentInbound.amount.toLocaleString() }}</strong>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentInbound.status)">{{ currentInbound.statusText }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentInbound.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <el-divider>入库商品明细</el-divider>
      
      <el-table :data="currentInbound?.items || []" size="small">
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="specification" label="规格" width="100" />
        <el-table-column prop="unit" label="单位" width="60" align="center" />
        <el-table-column prop="inboundQuantity" label="入库数量" width="80" align="center" />
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
  inboundNo: '',
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
const currentInbound = ref(null)

const inboundForm = reactive({
  orderNo: '',
  supplierName: '',
  warehouseId: '',
  inboundDate: new Date().toISOString().slice(0, 10),
  items: [],
  remark: ''
})

const inboundRules = {
  orderNo: [{ required: true, message: '请输入采购单号', trigger: 'blur' }],
  inboundDate: [{ required: true, message: '请选择入库日期', trigger: 'change' }],
  warehouseId: [{ required: true, message: '请选择仓库', trigger: 'change' }]
}

const warehouses = reactive([
  { id: 1, name: '主仓库' },
  { id: 2, name: '软件仓库' },
  { id: 3, name: '硬件仓库' }
])

const inboundList = reactive([
  { inboundNo: 'PI20240515001', orderNo: 'PO20240514001', inboundDate: '2024-05-15', supplierName: '微软(中国)有限公司', warehouseName: '软件仓库', productCount: 2, totalQuantity: 50, amount: 45000, status: 'completed', statusText: '已完成', operator: '张三', items: [] },
  { inboundNo: 'PI20240514002', orderNo: 'PO20240513002', inboundDate: '2024-05-14', supplierName: 'Adobe公司', warehouseName: '软件仓库', productCount: 1, totalQuantity: 20, amount: 28000, status: 'completed', statusText: '已完成', operator: '李四', items: [] },
  { inboundNo: 'PI20240513003', orderNo: 'PO20240512003', inboundDate: '2024-05-13', supplierName: '金山软件股份', warehouseName: '软件仓库', productCount: 3, totalQuantity: 100, amount: 15800, status: 'completed', statusText: '已完成', operator: '王五', items: [] },
  { inboundNo: 'PI20240512004', orderNo: 'PO20240511004', inboundDate: '2024-05-12', supplierName: '用友软件股份', warehouseName: '软件仓库', productCount: 2, totalQuantity: 30, amount: 35000, status: 'partial', statusText: '部分入库', operator: '张三', items: [] }
])

const totalQuantity = computed(() => {
  return inboundForm.items.reduce((sum, item) => sum + item.inboundQuantity, 0)
})

const totalAmount = computed(() => {
  return inboundForm.items.reduce((sum, item) => sum + item.price * item.inboundQuantity, 0)
})

const getStatusType = (status) => {
  const typeMap = { pending: 'warning', partial: 'info', completed: 'success' }
  return typeMap[status] || ''
}

const handleSearch = () => ElMessage.success('查询成功')
const handleReset = () => {
  searchForm.inboundNo = ''
  searchForm.orderNo = ''
  searchForm.dateRange = []
  searchForm.status = ''
}

const handleCreate = () => {
  inboundForm.orderNo = ''
  inboundForm.supplierName = ''
  inboundForm.warehouseId = ''
  inboundForm.items = []
  inboundForm.remark = ''
  formDialogVisible.value = true
}

const handleView = (row) => {
  currentInbound.value = row
  detailDialogVisible.value = true
}

const handleInbound = (row) => {
  currentInbound.value = row
  inboundForm.orderNo = row.orderNo
  inboundForm.supplierName = row.supplierName
  inboundForm.items = row.items.map(item => ({
    ...item,
    inboundQuantity: item.orderQuantity - item.inboundedQuantity
  }))
  formDialogVisible.value = true
}

const loadPurchaseOrder = () => {
  if (!inboundForm.orderNo) {
    ElMessage.warning('请输入采购单号')
    return
  }
  inboundForm.supplierName = '微软(中国)有限公司'
  inboundForm.items = [
    { productName: 'Office 365 商业版', specification: '年订阅', unit: '套', orderQuantity: 30, inboundQuantity: 25, inboundedQuantity: 0, price: 1999 },
    { productName: 'Microsoft 365 E3', specification: '年订阅', unit: '套', orderQuantity: 20, inboundQuantity: 20, inboundedQuantity: 0, price: 1200 }
  ]
  ElMessage.success('已加载采购单商品')
}

const viewOrder = (row) => ElMessage.info(`查看采购单: ${row.orderNo}`)
const handlePrint = (row) => ElMessage.success('正在打印...')

const handleSubmit = () => {
  if (!inboundForm.warehouseId) {
    ElMessage.warning('请选择仓库')
    return
  }
  const hasInbound = inboundForm.items.some(item => item.inboundQuantity > 0)
  if (!hasInbound) {
    ElMessage.warning('请输入入库数量')
    return
  }
  ElMessageBox.confirm(`确认入库，总数量 ${totalQuantity.value}，总金额 ¥${totalAmount.value.toLocaleString()}?`, '确认入库', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('入库成功')
    formDialogVisible.value = false
  }).catch(() => {})
}
</script>

<style scoped>
.purchase-inbound-page {
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

.inbound-summary {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
  text-align: right;
  font-size: 14px;
  margin-top: 15px;
}

.inbound-summary strong {
  color: #67C23A;
  font-size: 16px;
}
</style>
