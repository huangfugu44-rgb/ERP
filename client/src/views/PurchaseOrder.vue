<template>
  <div class="purchase-order-page">
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">采购订单</span>
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
        <el-form-item label="供应商">
          <el-select v-model="searchForm.supplierId" placeholder="选择供应商" clearable style="width: 180px">
            <el-option v-for="supplier in suppliers" :key="supplier.id" :label="supplier.name" :value="supplier.id" />
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
            <el-option label="待审核" value="pending" />
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
        <el-table-column prop="supplierName" label="供应商" />
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
        <el-table-column prop="actualAmount" label="应付金额" width="120" align="right">
          <template #default="{ row }">
            <span class="actual-amount">¥{{ row.actualAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)" v-if="row.status === 'draft'">编辑</el-button>
            <el-button link type="success" @click="handleApprove(row)" v-if="row.status === 'draft'">审核</el-button>
            <el-button link type="danger" @click="handleClose(row)" v-if="row.status !== 'closed'">关闭</el-button>
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

    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑采购订单' : '新建采购订单'" width="900px" destroy-on-close>
      <el-form :model="orderForm" :rules="orderRules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="供应商" prop="supplierId">
              <el-select v-model="orderForm.supplierId" placeholder="请选择供应商" style="width: 100%" @change="handleSupplierChange">
                <el-option v-for="supplier in suppliers" :key="supplier.id" :label="supplier.name" :value="supplier.id" />
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
            <el-form-item label="预计到货">
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
        <el-table-column prop="quantity" label="数量" width="100" align="center">
          <template #default="{ row, $index }">
            <el-input-number v-model="row.quantity" :min="1" size="small" @change="calculateAmount($index)" />
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
          <span class="label">应付金额:</span>
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
        <el-table-column prop="price" label="采购价" width="100" align="right">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" align="center" />
      </el-table>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="订单详情" width="900px" destroy-on-close>
      <el-descriptions :column="2" border v-if="currentOrder">
        <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单日期">{{ currentOrder.orderDate }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ currentOrder.supplierName }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ currentOrder.contact }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentOrder.phone }}</el-descriptions-item>
        <el-descriptions-item label="预计到货">{{ currentOrder.expectedDate }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">{{ currentOrder.address }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">¥{{ currentOrder.totalAmount.toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="应付金额">
          <strong style="color: #F56C6C">¥{{ currentOrder.actualAmount.toLocaleString() }}</strong>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'

const searchForm = reactive({
  orderNo: '',
  supplierId: '',
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
  supplierId: '',
  supplierName: '',
  orderDate: new Date().toISOString().slice(0, 10),
  contact: '',
  phone: '',
  address: '',
  expectedDate: '',
  items: [],
  discountAmount: 0,
  remark: ''
})

const orderRules = {
  supplierId: [{ required: true, message: '请选择供应商', trigger: 'change' }],
  orderDate: [{ required: true, message: '请选择订单日期', trigger: 'change' }]
}

const suppliers = reactive([
  { id: 1, name: '微软(中国)有限公司', contact: '张经理', phone: '400-820-8666' },
  { id: 2, name: 'Adobe公司', contact: '李经理', phone: '400-600-8000' },
  { id: 3, name: '金山软件股份', contact: '王经理', phone: '400-880-8686' },
  { id: 4, name: '用友软件股份', contact: '赵经理', phone: '400-660-8900' },
  { id: 5, name: '联想集团', contact: '刘经理', phone: '400-100-9000' }
])

const products = reactive([
  { id: 1, name: 'Office 365 商业版', code: 'SOFT001', specification: '年订阅', unit: '套', price: 1999, stock: 100 },
  { id: 2, name: 'Adobe Creative Cloud', code: 'SOFT002', specification: '年订阅', unit: '套', price: 2999, stock: 50 },
  { id: 3, name: '金山文档企业版', code: 'SOFT003', specification: '年订阅', unit: '套', price: 899, stock: 200 },
  { id: 4, name: '用友U8软件', code: 'SOFT004', specification: '标准版', unit: '套', price: 5800, stock: 30 },
  { id: 5, name: 'ThinkPad笔记本', code: 'HARD001', specification: 'T14', unit: '台', price: 5999, stock: 20 }
])

const orderList = reactive([
  { orderNo: 'PO20240515001', orderDate: '2024-05-15', supplierName: '微软(中国)有限公司', contact: '张经理', phone: '13800138001', address: '深圳市南山区', productCount: 3, totalAmount: 8997, discountAmount: 0, actualAmount: 8997, status: 'draft', statusText: '草稿' },
  { orderNo: 'PO20240514002', orderDate: '2024-05-14', supplierName: 'Adobe公司', contact: '李经理', phone: '13800138002', address: '北京市朝阳区', productCount: 2, totalAmount: 5998, discountAmount: 0, actualAmount: 5998, status: 'approved', statusText: '已审核' },
  { orderNo: 'PO20240513003', orderDate: '2024-05-13', supplierName: '金山软件股份', contact: '王经理', phone: '13800138003', address: '广州市天河区', productCount: 5, totalAmount: 12995, discountAmount: 500, actualAmount: 12495, status: 'approved', statusText: '已审核' },
  { orderNo: 'PO20240512004', orderDate: '2024-05-12', supplierName: '联想集团', contact: '刘经理', phone: '13800138004', address: '东莞市松山湖', productCount: 2, totalAmount: 19998, discountAmount: 0, actualAmount: 19998, status: 'completed', statusText: '已完成' },
  { orderNo: 'PO20240511005', orderDate: '2024-05-11', supplierName: '用友软件股份', contact: '赵经理', phone: '13800138005', address: '北京市海淀区', productCount: 3, totalAmount: 23400, discountAmount: 1000, actualAmount: 22400, status: 'completed', statusText: '已完成' }
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
  const typeMap = { draft: 'info', pending: 'warning', approved: 'success', completed: 'success', closed: '' }
  return typeMap[status] || ''
}

const handleSearch = () => ElMessage.success('查询成功')
const handleReset = () => {
  searchForm.orderNo = ''
  searchForm.supplierId = ''
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

const handleClose = (row) => {
  ElMessageBox.confirm(`确定要关闭订单 ${row.orderNo} 吗?`, '关闭确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'closed'
    row.statusText = '已关闭'
    ElMessage.success('订单已关闭')
  }).catch(() => {})
}

const handleSupplierChange = (supplierId) => {
  const supplier = suppliers.find(s => s.id === supplierId)
  if (supplier) {
    orderForm.supplierName = supplier.name
    orderForm.contact = supplier.contact
    orderForm.phone = supplier.phone
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

const calculateSummary = () => {
  actualAmount.value
}

const handleSaveDraft = () => {
  ElMessage.success('草稿保存成功')
  formDialogVisible.value = false
}

const handleSubmit = () => {
  if (!orderForm.supplierId) {
    ElMessage.warning('请选择供应商')
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
  orderForm.supplierId = ''
  orderForm.supplierName = ''
  orderForm.orderDate = new Date().toISOString().slice(0, 10)
  orderForm.contact = ''
  orderForm.phone = ''
  orderForm.address = ''
  orderForm.expectedDate = ''
  orderForm.items = []
  orderForm.discountAmount = 0
  orderForm.remark = ''
}
</script>

<style scoped>
.purchase-order-page {
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
