<template>
  <div class="finance-payment-page">
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">付款单</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              新建付款单
            </el-button>
          </div>
        </div>
      </template>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="单据编号">
          <el-input v-model="searchForm.paymentNo" placeholder="请输入单据编号" clearable />
        </el-form-item>
        <el-form-item label="供应商">
          <el-select v-model="searchForm.supplierId" placeholder="选择供应商" clearable style="width: 180px">
            <el-option v-for="supplier in suppliers" :key="supplier.id" :label="supplier.name" :value="supplier.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="付款日期">
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
            <el-option label="待审核" value="pending" />
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
      <el-table :data="paymentList" stripe style="width: 100%">
        <el-table-column prop="paymentNo" label="单据编号" width="180" />
        <el-table-column prop="paymentDate" label="付款日期" width="120" />
        <el-table-column prop="supplierName" label="供应商" />
        <el-table-column prop="orderNo" label="关联订单" width="150" />
        <el-table-column prop="amount" label="付款金额" width="120" align="right">
          <template #default="{ row }">
            <span class="amount">¥{{ row.amount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="accountName" label="付款账户" width="120" />
        <el-table-column prop="paymentMethod" label="付款方式" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.paymentMethod }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="success" @click="handleApprove(row)" v-if="row.status === 'pending'">审核</el-button>
            <el-button link type="danger" @click="handleDelete(row)" v-if="row.status === 'pending'">删除</el-button>
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

    <el-dialog v-model="formDialogVisible" title="新建付款单" width="700px" destroy-on-close>
      <el-form :model="paymentForm" :rules="paymentRules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="供应商" prop="supplierId">
              <el-select v-model="paymentForm.supplierId" placeholder="请选择供应商" style="width: 100%" @change="handleSupplierChange">
                <el-option v-for="supplier in suppliers" :key="supplier.id" :label="supplier.name" :value="supplier.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="付款日期" prop="paymentDate">
              <el-date-picker
                v-model="paymentForm.paymentDate"
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
            <el-form-item label="付款账户" prop="accountId">
              <el-select v-model="paymentForm.accountId" placeholder="选择账户" style="width: 100%">
                <el-option v-for="account in accounts" :key="account.id" :label="account.name" :value="account.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="付款方式" prop="paymentMethod">
              <el-select v-model="paymentForm.paymentMethod" placeholder="选择方式" style="width: 100%">
                <el-option label="银行转账" value="bank" />
                <el-option label="现金" value="cash" />
                <el-option label="支票" value="cheque" />
                <el-option label="汇票" value="draft" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="付款金额" prop="amount">
          <el-input-number v-model="paymentForm.amount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="关联订单">
          <el-select v-model="paymentForm.orderId" placeholder="选择关联订单(可选)" clearable style="width: 100%">
            <el-option v-for="order in supplierOrders" :key="order.id" :label="order.orderNo" :value="order.id">
              <span>{{ order.orderNo }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">¥{{ order.amount.toLocaleString() }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="paymentForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认付款</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="付款单详情" width="700px" destroy-on-close>
      <el-descriptions :column="2" border v-if="currentPayment">
        <el-descriptions-item label="单据编号">{{ currentPayment.paymentNo }}</el-descriptions-item>
        <el-descriptions-item label="付款日期">{{ currentPayment.paymentDate }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ currentPayment.supplierName }}</el-descriptions-item>
        <el-descriptions-item label="关联订单">{{ currentPayment.orderNo || '无' }}</el-descriptions-item>
        <el-descriptions-item label="付款金额">
          <strong style="color: #F56C6C; font-size: 18px">¥{{ currentPayment.amount.toLocaleString() }}</strong>
        </el-descriptions-item>
        <el-descriptions-item label="付款方式">{{ currentPayment.paymentMethod }}</el-descriptions-item>
        <el-descriptions-item label="付款账户">{{ currentPayment.accountName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentPayment.status)">{{ currentPayment.statusText }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作员">{{ currentPayment.operator }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ currentPayment.approveStatus }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentPayment.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handlePrint">打印</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'

const searchForm = reactive({
  paymentNo: '',
  supplierId: '',
  dateRange: [],
  status: ''
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(4)
const formDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const formRef = ref(null)
const currentPayment = ref(null)

const paymentForm = reactive({
  supplierId: '',
  supplierName: '',
  paymentDate: new Date().toISOString().slice(0, 10),
  accountId: '',
  paymentMethod: 'bank',
  amount: 0,
  orderId: '',
  remark: ''
})

const paymentRules = {
  supplierId: [{ required: true, message: '请选择供应商', trigger: 'change' }],
  paymentDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
  accountId: [{ required: true, message: '请选择账户', trigger: 'change' }],
  paymentMethod: [{ required: true, message: '请选择方式', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }]
}

const suppliers = reactive([
  { id: 1, name: '微软(中国)有限公司' },
  { id: 2, name: 'Adobe公司' },
  { id: 3, name: '金山软件股份' },
  { id: 4, name: '用友软件股份' },
  { id: 5, name: '联想集团' }
])

const accounts = reactive([
  { id: 1, name: '中国银行 (4567)' },
  { id: 2, name: '工商银行 (8901)' },
  { id: 3, name: '建设银行 (2345)' },
  { id: 4, name: '现金' }
])

const supplierOrders = reactive([])

const paymentList = reactive([
  { paymentNo: 'PM20240515001', paymentDate: '2024-05-15', supplierName: '微软(中国)有限公司', orderNo: 'PO20240512001', amount: 45000, accountName: '中国银行', paymentMethod: '银行转账', status: 'completed', statusText: '已完成', operator: '张三', approveStatus: '已审核' },
  { paymentNo: 'PM20240514002', paymentDate: '2024-05-14', supplierName: 'Adobe公司', orderNo: 'PO20240513002', amount: 28000, accountName: '工商银行', paymentMethod: '银行转账', status: 'completed', statusText: '已完成', operator: '李四', approveStatus: '已审核' },
  { paymentNo: 'PM20240513003', paymentDate: '2024-05-13', supplierName: '金山软件股份', orderNo: 'PO20240512003', amount: 15800, accountName: '建设银行', paymentMethod: '支票', status: 'completed', statusText: '已完成', operator: '王五', approveStatus: '已审核' },
  { paymentNo: 'PM20240512004', paymentDate: '2024-05-12', supplierName: '用友软件股份', orderNo: '', amount: 10000, accountName: '现金', paymentMethod: '现金', status: 'pending', statusText: '待审核', operator: '张三', approveStatus: '待审核' }
])

const getStatusType = (status) => {
  const typeMap = { pending: 'warning', completed: 'success' }
  return typeMap[status] || ''
}

const handleSearch = () => ElMessage.success('查询成功')
const handleReset = () => {
  searchForm.paymentNo = ''
  searchForm.supplierId = ''
  searchForm.dateRange = []
  searchForm.status = ''
}

const handleCreate = () => {
  paymentForm.supplierId = ''
  paymentForm.supplierName = ''
  paymentForm.paymentDate = new Date().toISOString().slice(0, 10)
  paymentForm.accountId = ''
  paymentForm.paymentMethod = 'bank'
  paymentForm.amount = 0
  paymentForm.orderId = ''
  paymentForm.remark = ''
  formDialogVisible.value = true
}

const handleSupplierChange = (supplierId) => {
  const supplier = suppliers.find(s => s.id === supplierId)
  if (supplier) {
    paymentForm.supplierName = supplier.name
    supplierOrders.splice(0, supplierOrders.length, 
      { id: 1, orderNo: 'PO20240515001', amount: 45000 },
      { id: 2, orderNo: 'PO20240515002', amount: 32000 }
    )
  }
}

const handleView = (row) => {
  currentPayment.value = row
  detailDialogVisible.value = true
}

const handleApprove = (row) => {
  ElMessageBox.confirm(`确定要审核付款单 ${row.paymentNo} 吗?`, '审核确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'completed'
    row.statusText = '已完成'
    row.approveStatus = '已审核'
    ElMessage.success('审核成功')
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除付款单 ${row.paymentNo} 吗?`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = paymentList.findIndex(item => item.paymentNo === row.paymentNo)
    if (index > -1) {
      paymentList.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleSubmit = () => {
  if (!paymentForm.supplierId || !paymentForm.accountId || paymentForm.amount <= 0) {
    ElMessage.warning('请填写完整信息')
    return
  }
  ElMessageBox.confirm(`确认付款，金额 ¥${paymentForm.amount.toLocaleString()}?`, '确认付款', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('付款成功')
    formDialogVisible.value = false
  }).catch(() => {})
}

const handlePrint = () => ElMessage.success('正在打印...')
</script>

<style scoped>
.finance-payment-page {
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
  font-weight: 600;
  color: #F56C6C;
}
</style>
