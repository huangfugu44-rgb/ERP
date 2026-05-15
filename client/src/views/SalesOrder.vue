<template>
  <div class="sales-order-page">
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">销售订单</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              新建订单
            </el-button>
          </div>
        </div>
      </template>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item label="客户">
          <el-select v-model="searchForm.customerId" placeholder="选择客户" clearable style="width: 200px">
            <el-option v-for="customer in customers" :key="customer.id" :label="customer.name" :value="customer.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单日期">
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
            <el-option label="草稿" value="draft" />
            <el-option label="已审核" value="approved" />
            <el-option label="已完成" value="completed" />
            <el-option label="已关闭" value="closed" />
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
      <el-table :data="orderList" stripe style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="orderDate" label="订单日期" width="120" />
        <el-table-column prop="customerName" label="客户" />
        <el-table-column prop="contact" label="联系人" width="100" />
        <el-table-column prop="productCount" label="商品数量" width="100" align="center" />
        <el-table-column prop="totalAmount" label="订单金额" width="120" align="right">
          <template #default="{ row }">
            <span class="amount">¥{{ row.totalAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="discountAmount" label="折扣" width="80" align="right">
          <template #default="{ row }">
            <span class="discount">-¥{{ row.discountAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="actualAmount" label="应收金额" width="120" align="right">
          <template #default="{ row }">
            <span class="actual-amount">¥{{ row.actualAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="receivedAmount" label="已收款" width="100" align="right">
          <template #default="{ row }">
            <span class="received">¥{{ row.receivedAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)" v-if="row.status === 'draft'">编辑</el-button>
            <el-button link type="success" @click="handleApprove(row)" v-if="row.status === 'draft'">审核</el-button>
            <el-button link type="warning" @click="handleOutbound(row)" v-if="row.status === 'approved'">出库</el-button>
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

    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑销售订单' : '新建销售订单'" width="900px" destroy-on-close>
      <el-form :model="orderForm" :rules="orderRules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户" prop="customerId">
              <el-select v-model="orderForm.customerId" placeholder="请选择客户" style="width: 100%" @change="handleCustomerChange">
                <el-option v-for="customer in customers" :key="customer.id" :label="customer.name" :value="customer.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单日期" prop="orderDate">
              <el-date-picker
                v-model="orderForm.orderDate"
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
            <el-form-item label="联系人">
              <el-input v-model="orderForm.contact" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="orderForm.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="收货地址">
              <el-input v-model="orderForm.address" placeholder="请输入收货地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计发货">
              <el-date-picker
                v-model="orderForm.expectedDate"
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
            <el-form-item label="销售人员">
              <el-select v-model="orderForm.salesperson" placeholder="选择销售人员" style="width: 100%">
                <el-option label="张三" value="张三" />
                <el-option label="李四" value="李四" />
                <el-option label="王五" value="王五" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <el-divider>商品明细</el-divider>
      
      <div class="product-actions">
        <el-button type="primary" size="small" @click="showProductDialog">
          <el-icon><Plus /></el-icon>
          添加商品
        </el-button>
      </div>
      
      <el-table :data="orderForm.items" size="small" class="product-table">
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="specification" label="规格" width="120" />
        <el-table-column prop="unit" label="单位" width="60" align="center" />
        <el-table-column prop="stock" label="库存" width="80" align="center">
          <template #default="{ row }">
            <span :class="{ 'low-stock': row.stock < row.quantity }">{{ row.stock }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="100" align="center">
          <template #default="{ row, $index }">
            <el-input-number v-model="row.quantity" :min="1" :max="row.stock" size="small" @change="calculateAmount($index)" />
          </template>
        </el-table-column>
        <el-table-column prop="price" label="单价" width="120" align="right">
          <template #default="{ row, $index }">
            <el-input-number v-model="row.price" :min="0" :precision="2" size="small" @change="calculateAmount($index)" />
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120" align="right">
          <template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="操作" width="60" align="center">
          <template #default="{ row, $index }">
            <el-button type="danger" size="small" link @click="removeItem($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="order-summary">
        <div class="summary-item">
          <span class="label">商品总额:</span>
          <span class="value">¥{{ totalAmount.toLocaleString() }}</span>
        </div>
        <div class="summary-item">
          <span class="label">折扣金额:</span>
          <el-input-number v-model="orderForm.discountAmount" :min="0" :precision="2" size="small" style="width: 120px" @change="calculateSummary" />
        </div>
        <div class="summary-item total">
          <span class="label">应收金额:</span>
          <span class="value">¥{{ actualAmount.toLocaleString() }}</span>
        </div>
      </div>
      
      <el-form :model="orderForm" label-width="100px" style="margin-top: 20px">
        <el-form-item label="备注">
          <el-input v-model="orderForm.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <el-button type="primary" @click="handleSubmit">提交订单</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="productDialogVisible" title="选择商品" width="700px" destroy-on-close>
      <el-input v-model="productSearch" placeholder="搜索商品名称/编码" clearable style="margin-bottom: 15px">
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-table :data="filteredProducts" stripe size="small" max-height="400" @row-click="selectProduct">
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="code" label="编码" width="120" />
        <el-table-column prop="specification" label="规格" width="100" />
        <el-table-column prop="price" label="销售价" width="100" align="right">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" align="center" />
      </el-table>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="订单详情" width="900px" destroy-on-close>
      <el-descriptions :column="2" border v-if="currentOrder">
        <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单日期">{{ currentOrder.orderDate }}</el-descriptions-item>
        <el-descriptions-item label="客户">{{ currentOrder.customerName }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ currentOrder.contact }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentOrder.phone }}</el-descriptions-item>
        <el-descriptions-item label="销售人员">{{ currentOrder.salesperson }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">{{ currentOrder.address }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">¥{{ currentOrder.totalAmount.toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="应收金额">
          <strong style="color: #F56C6C">¥{{ currentOrder.actualAmount.toLocaleString() }}</strong>
        </el-descriptions-item>
        <el-descriptions-item label="已收款">¥{{ currentOrder.receivedAmount.toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="未收款">
          <strong>¥{{ (currentOrder.actualAmount - currentOrder.receivedAmount).toLocaleString() }}</strong>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentOrder.status)">{{ currentOrder.statusText }}</el-tag>
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'

const router = useRouter()

const searchForm = reactive({
  orderNo: '',
  customerId: '',
  dateRange: [],
  status: ''
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(5)
const formDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const productDialogVisible = ref(false)
const productSearch = ref('')
const isEdit = ref(false)
const formRef = ref(null)
const currentOrder = ref(null)

const orderForm = reactive({
  customerId: '',
  customerName: '',
  orderDate: new Date().toISOString().slice(0, 10),
  contact: '',
  phone: '',
  address: '',
  expectedDate: '',
  salesperson: '',
  items: [],
  discountAmount: 0,
  remark: ''
})

const orderRules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  orderDate: [{ required: true, message: '请选择订单日期', trigger: 'change' }]
}

const customers = reactive([
  { id: 1, name: '深圳市科技有限公司', contact: '张经理', phone: '0755-12345678' },
  { id: 2, name: '广州市软件企业', contact: '李经理', phone: '020-23456789' },
  { id: 3, name: '东莞市网络公司', contact: '王经理', phone: '0769-34567890' },
  { id: 4, name: '佛山市信息科技', contact: '赵经理', phone: '0757-45678901' },
  { id: 5, name: '惠州市电子集团', contact: '刘经理', phone: '0752-56789012' }
])

const products = reactive([
  { id: 1, name: 'Office 365 商业版', code: 'SOFT001', specification: '年订阅', unit: '套', price: 2199, stock: 50 },
  { id: 2, name: 'Adobe Creative Cloud', code: 'SOFT002', specification: '年订阅', unit: '套', price: 3299, stock: 30 },
  { id: 3, name: '金山文档企业版', code: 'SOFT003', specification: '年订阅', unit: '套', price: 999, stock: 100 },
  { id: 4, name: '用友U8软件', code: 'SOFT004', specification: '标准版', unit: '套', price: 6800, stock: 20 },
  { id: 5, name: 'ThinkPad笔记本', code: 'HARD001', specification: 'T14', unit: '台', price: 6999, stock: 15 }
])

const orderList = reactive([
  { orderNo: 'SO20240515001', orderDate: '2024-05-15', customerName: '深圳市科技有限公司', contact: '张经理', phone: '0755-12345678', address: '深圳市南山区', salesperson: '张三', productCount: 3, totalAmount: 12597, discountAmount: 0, actualAmount: 12597, receivedAmount: 0, status: 'draft', statusText: '草稿' },
  { orderNo: 'SO20240514002', orderDate: '2024-05-14', customerName: '广州市软件企业', contact: '李经理', phone: '020-23456789', address: '广州市天河区', salesperson: '李四', productCount: 2, totalAmount: 7598, discountAmount: 500, actualAmount: 7098, receivedAmount: 5000, status: 'approved', statusText: '已审核' },
  { orderNo: 'SO20240513003', orderDate: '2024-05-13', customerName: '东莞市网络公司', contact: '王经理', phone: '0769-34567890', address: '东莞市松山湖', salesperson: '张三', productCount: 4, totalAmount: 18996, discountAmount: 0, actualAmount: 18996, receivedAmount: 10000, status: 'approved', statusText: '已审核' },
  { orderNo: 'SO20240512004', orderDate: '2024-05-12', customerName: '佛山市信息科技', contact: '赵经理', phone: '0757-45678901', address: '佛山市禅城区', salesperson: '王五', productCount: 2, totalAmount: 9998, discountAmount: 0, actualAmount: 9998, receivedAmount: 9998, status: 'completed', statusText: '已完成' },
  { orderNo: 'SO20240511005', orderDate: '2024-05-11', customerName: '惠州市电子集团', contact: '刘经理', phone: '0752-56789012', address: '惠州市惠城区', salesperson: '李四', productCount: 3, totalAmount: 23497, discountAmount: 1000, actualAmount: 22497, receivedAmount: 22497, status: 'completed', statusText: '已完成' }
])

const filteredProducts = computed(() => {
  if (!productSearch.value) return products
  const keyword = productSearch.value.toLowerCase()
  return products.filter(p => 
    p.name.toLowerCase().includes(keyword) || 
    p.code.toLowerCase().includes(keyword)
  )
})

const totalAmount = computed(() => {
  return orderForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const actualAmount = computed(() => {
  return Math.max(0, totalAmount.value - orderForm.discountAmount)
})

const getStatusType = (status) => {
  const typeMap = { draft: 'info', approved: 'warning', completed: 'success', closed: '' }
  return typeMap[status] || ''
}

const handleSearch = () => ElMessage.success('查询成功')
const handleReset = () => {
  searchForm.orderNo = ''
  searchForm.customerId = ''
  searchForm.dateRange = []
  searchForm.status = ''
}

const handleCreate = () => {
  isEdit.value = false
  resetForm()
  formDialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(orderForm, row)
  formDialogVisible.value = true
}

const handleView = (row) => {
  currentOrder.value = row
  detailDialogVisible.value = true
}

const handleApprove = (row) => {
  ElMessageBox.confirm(`确定要审核订单 ${row.orderNo} 吗?`, '审核确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'approved'
    row.statusText = '已审核'
    ElMessage.success('审核成功')
  }).catch(() => {})
}

const handleOutbound = (row) => {
  router.push('/sales/outbound')
}

const handleCustomerChange = (customerId) => {
  const customer = customers.find(c => c.id === customerId)
  if (customer) {
    orderForm.customerName = customer.name
    orderForm.contact = customer.contact
    orderForm.phone = customer.phone
  }
}

const showProductDialog = () => productDialogVisible.value = true

const selectProduct = (row) => {
  const exists = orderForm.items.find(item => item.productId === row.id)
  if (exists) {
    exists.quantity++
    calculateAmount(orderForm.items.indexOf(exists))
  } else {
    orderForm.items.push({
      productId: row.id,
      productName: row.name,
      specification: row.specification,
      unit: row.unit,
      stock: row.stock,
      quantity: 1,
      price: row.price,
      amount: row.price
    })
  }
  productDialogVisible.value = false
}

const removeItem = (index) => orderForm.items.splice(index, 1)

const calculateAmount = (index) => {
  const item = orderForm.items[index]
  item.amount = item.price * item.quantity
}

const calculateSummary = () => actualAmount.value

const handleSaveDraft = () => {
  ElMessage.success('草稿保存成功')
  formDialogVisible.value = false
}

const handleSubmit = () => {
  if (!orderForm.customerId) {
    ElMessage.warning('请选择客户')
    return
  }
  if (orderForm.items.length === 0) {
    ElMessage.warning('请添加商品')
    return
  }
  ElMessageBox.confirm(`确认提交订单，总金额 ¥${actualAmount.value.toLocaleString()}?`, '确认提交', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('订单提交成功')
    formDialogVisible.value = false
  }).catch(() => {})
}

const handlePrint = () => ElMessage.success('正在打印...')

const resetForm = () => {
  orderForm.customerId = ''
  orderForm.customerName = ''
  orderForm.orderDate = new Date().toISOString().slice(0, 10)
  orderForm.contact = ''
  orderForm.phone = ''
  orderForm.address = ''
  orderForm.expectedDate = ''
  orderForm.salesperson = ''
  orderForm.items = []
  orderForm.discountAmount = 0
  orderForm.remark = ''
}
</script>

<style scoped>
.sales-order-page {
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

.amount { font-weight: 500; }
.discount { color: #67C23A; }
.actual-amount { font-weight: 600; color: #F56C6C; }
.received { color: #67C23A; }
.low-stock { color: #F56C6C; }

.product-actions {
  margin-bottom: 15px;
}

.product-table {
  margin-bottom: 15px;
}

.order-summary {
  display: flex;
  justify-content: flex-end;
  gap: 30px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-item .label {
  font-size: 14px;
  color: #606266;
}

.summary-item .value {
  font-size: 16px;
  font-weight: 600;
}

.summary-item.total .value {
  font-size: 20px;
  color: #F56C6C;
}
</style>
