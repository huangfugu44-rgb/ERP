<template>
  <div class="finance-receipt-page">
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">收款单</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              新建收款单
            </el-button>
          </div>
        </div>
      </template>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="单据编号">
          <el-input v-model="searchForm.receiptNo" placeholder="请输入单据编号" clearable />
        </el-form-item>
        <el-form-item label="客户">
          <el-select v-model="searchForm.customerId" placeholder="选择客户" clearable style="width: 180px">
            <el-option v-for="customer in customers" :key="customer.id" :label="customer.name" :value="customer.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="收款日期">
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
      <el-table :data="receiptList" stripe style="width: 100%">
        <el-table-column prop="receiptNo" label="单据编号" width="180" />
        <el-table-column prop="receiptDate" label="收款日期" width="120" />
        <el-table-column prop="customerName" label="客户" />
        <el-table-column prop="orderNo" label="关联订单" width="150" />
        <el-table-column prop="amount" label="收款金额" width="120" align="right">
          <template #default="{ row }">
            <span class="amount">¥{{ row.amount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="accountName" label="收款账户" width="120" />
        <el-table-column prop="paymentMethod" label="收款方式" width="100" align="center">
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

    <el-dialog v-model="formDialogVisible" title="新建收款单" width="700px" destroy-on-close>
      <el-form :model="receiptForm" :rules="receiptRules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户" prop="customerId">
              <el-select v-model="receiptForm.customerId" placeholder="请选择客户" style="width: 100%" @change="handleCustomerChange">
                <el-option v-for="customer in customers" :key="customer.id" :label="customer.name" :value="customer.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收款日期" prop="receiptDate">
              <el-date-picker
                v-model="receiptForm.receiptDate"
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
            <el-form-item label="收款账户" prop="accountId">
              <el-select v-model="receiptForm.accountId" placeholder="选择账户" style="width: 100%">
                <el-option v-for="account in accounts" :key="account.id" :label="account.name" :value="account.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收款方式" prop="paymentMethod">
              <el-select v-model="receiptForm.paymentMethod" placeholder="选择方式" style="width: 100%">
                <el-option label="银行转账" value="bank" />
                <el-option label="现金" value="cash" />
                <el-option label="微信" value="wechat" />
                <el-option label="支付宝" value="alipay" />
                <el-option label="汇票" value="draft" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="收款金额" prop="amount">
          <el-input-number v-model="receiptForm.amount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="关联订单">
          <el-select v-model="receiptForm.orderId" placeholder="选择关联订单(可选)" clearable style="width: 100%">
            <el-option v-for="order in customerOrders" :key="order.id" :label="order.orderNo" :value="order.id">
              <span>{{ order.orderNo }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">¥{{ order.amount.toLocaleString() }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="receiptForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认收款</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="收款单详情" width="700px" destroy-on-close>
      <el-descriptions :column="2" border v-if="currentReceipt">
        <el-descriptions-item label="单据编号">{{ currentReceipt.receiptNo }}</el-descriptions-item>
        <el-descriptions-item label="收款日期">{{ currentReceipt.receiptDate }}</el-descriptions-item>
        <el-descriptions-item label="客户">{{ currentReceipt.customerName }}</el-descriptions-item>
        <el-descriptions-item label="关联订单">{{ currentReceipt.orderNo || '无' }}</el-descriptions-item>
        <el-descriptions-item label="收款金额">
          <strong style="color: #67C23A; font-size: 18px">¥{{ currentReceipt.amount.toLocaleString() }}</strong>
        </el-descriptions-item>
        <el-descriptions-item label="收款方式">{{ currentReceipt.paymentMethod }}</el-descriptions-item>
        <el-descriptions-item label="收款账户">{{ currentReceipt.accountName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentReceipt.status)">{{ currentReceipt.statusText }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作员">{{ currentReceipt.operator }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ currentReceipt.approveStatus }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentReceipt.remark || '无' }}</el-descriptions-item>
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
  receiptNo: '',
  customerId: '',
  dateRange: [],
  status: ''
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(4)
const formDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const formRef = ref(null)
const currentReceipt = ref(null)

const receiptForm = reactive({
  customerId: '',
  customerName: '',
  receiptDate: new Date().toISOString().slice(0, 10),
  accountId: '',
  paymentMethod: 'bank',
  amount: 0,
  orderId: '',
  remark: ''
})

const receiptRules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  receiptDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
  accountId: [{ required: true, message: '请选择账户', trigger: 'change' }],
  paymentMethod: [{ required: true, message: '请选择方式', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }]
}

const customers = reactive([
  { id: 1, name: '深圳市科技有限公司' },
  { id: 2, name: '广州市软件企业' },
  { id: 3, name: '东莞市网络公司' },
  { id: 4, name: '佛山市信息科技' },
  { id: 5, name: '惠州市电子集团' }
])

const accounts = reactive([
  { id: 1, name: '中国银行 (4567)' },
  { id: 2, name: '工商银行 (8901)' },
  { id: 3, name: '建设银行 (2345)' },
  { id: 4, name: '现金' }
])

const customerOrders = reactive([])

const receiptList = reactive([
  { receiptNo: 'RC20240515001', receiptDate: '2024-05-15', customerName: '深圳市科技有限公司', orderNo: 'SO20240514001', amount: 50000, accountName: '中国银行', paymentMethod: '银行转账', status: 'completed', statusText: '已完成', operator: '张三', approveStatus: '已审核' },
  { receiptNo: 'RC20240514002', receiptDate: '2024-05-14', customerName: '广州市软件企业', orderNo: 'SO20240513002', amount: 20000, accountName: '工商银行', paymentMethod: '银行转账', status: 'completed', statusText: '已完成', operator: '李四', approveStatus: '已审核' },
  { receiptNo: 'RC20240513003', receiptDate: '2024-05-13', customerName: '东莞市网络公司', orderNo: 'SO20240512003', amount: 15000, accountName: '建设银行', paymentMethod: '微信', status: 'completed', statusText: '已完成', operator: '王五', approveStatus: '已审核' },
  { receiptNo: 'RC20240512004', receiptDate: '2024-05-12', customerName: '佛山市信息科技', orderNo: '', amount: 10000, accountName: '现金', paymentMethod: '现金', status: 'pending', statusText: '待审核', operator: '张三', approveStatus: '待审核' }
])

const getStatusType = (status) => {
  const typeMap = { pending: 'warning', completed: 'success' }
  return typeMap[status] || ''
}

const handleSearch = () => ElMessage.success('查询成功')
const handleReset = () => {
  searchForm.receiptNo = ''
  searchForm.customerId = ''
  searchForm.dateRange = []
  searchForm.status = ''
}

const handleCreate = () => {
  receiptForm.customerId = ''
  receiptForm.customerName = ''
  receiptForm.receiptDate = new Date().toISOString().slice(0, 10)
  receiptForm.accountId = ''
  receiptForm.paymentMethod = 'bank'
  receiptForm.amount = 0
  receiptForm.orderId = ''
  receiptForm.remark = ''
  formDialogVisible.value = true
}

const handleCustomerChange = (customerId) => {
  const customer = customers.find(c => c.id === customerId)
  if (customer) {
    receiptForm.customerName = customer.name
    customerOrders.splice(0, customerOrders.length, 
      { id: 1, orderNo: 'SO20240515001', amount: 58000 },
      { id: 2, orderNo: 'SO20240515002', amount: 32000 }
    )
  }
}

const handleView = (row) => {
  currentReceipt.value = row
  detailDialogVisible.value = true
}

const handleApprove = (row) => {
  ElMessageBox.confirm(`确定要审核收款单 ${row.receiptNo} 吗?`, '审核确认', {
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
  ElMessageBox.confirm(`确定要删除收款单 ${row.receiptNo} 吗?`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = receiptList.findIndex(item => item.receiptNo === row.receiptNo)
    if (index > -1) {
      receiptList.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleSubmit = () => {
  if (!receiptForm.customerId || !receiptForm.accountId || receiptForm.amount <= 0) {
    ElMessage.warning('请填写完整信息')
    return
  }
  ElMessageBox.confirm(`确认收款，金额 ¥${receiptForm.amount.toLocaleString()}?`, '确认收款', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('收款成功')
    formDialogVisible.value = false
  }).catch(() => {})
}

const handlePrint = () => ElMessage.success('正在打印...')
</script>

<style scoped>
.finance-receipt-page {
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
  color: #67C23A;
}
</style>
