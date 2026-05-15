<template>
  <div class="retail-return-page">
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">零售退货</span>
        </div>
      </template>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="原单号">
          <el-input v-model="searchForm.originalOrderNo" placeholder="请输入原零售单号" clearable />
        </el-form-item>
        <el-form-item label="退货日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
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
      <el-table :data="returnList" stripe style="width: 100%">
        <el-table-column prop="returnNo" label="退货单号" width="180" />
        <el-table-column prop="originalOrderNo" label="原单号" width="180">
          <template #default="{ row }">
            <el-button link @click="viewOriginalOrder(row)">{{ row.originalOrderNo }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="returnDate" label="退货日期" width="120" />
        <el-table-column prop="customerName" label="客户名称" />
        <el-table-column prop="productCount" label="商品数量" width="100" align="center" />
        <el-table-column prop="returnAmount" label="退货金额" width="120" align="right">
          <template #default="{ row }">
            <span class="return-amount">-¥{{ row.returnAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="refundMethod" label="退款方式" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.refundMethod }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作员" width="100" align="center" />
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="danger" @click="handleDelete(row)" :disabled="row.status === '已退款'">删除</el-button>
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

    <el-dialog v-model="returnDialogVisible" title="新增退货单" width="800px" destroy-on-close>
      <el-form :model="returnForm" label-width="100px">
        <el-form-item label="原单号">
          <el-input v-model="returnForm.originalOrderNo" placeholder="请输入或扫描原零售单号">
            <template #append>
              <el-button @click="loadOriginalOrder">加载</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="客户名称">
          <el-input v-model="returnForm.customerName" disabled />
        </el-form-item>
        <el-form-item label="退货日期">
          <el-date-picker
            v-model="returnForm.returnDate"
            type="date"
            placeholder="选择退货日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <el-divider>退货商品</el-divider>
      
      <el-table :data="returnForm.items" size="small">
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="originalQuantity" label="原数量" width="80" align="center" />
        <el-table-column prop="returnQuantity" label="退货数量" width="120" align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.returnQuantity" :min="1" :max="row.originalQuantity" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="price" label="单价" width="100" align="right">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="returnAmount" label="退货金额" width="120" align="right">
          <template #default="{ row }">¥{{ (row.price * row.returnQuantity).toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ row, $index }">
            <el-button type="danger" size="small" link @click="removeReturnItem($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="return-summary">
        <span>退货总金额: </span>
        <span class="amount">¥{{ totalReturnAmount.toLocaleString() }}</span>
      </div>
      
      <el-form :model="returnForm" label-width="100px" style="margin-top: 20px">
        <el-form-item label="退款方式">
          <el-radio-group v-model="returnForm.refundMethod">
            <el-radio value="cash">现金</el-radio>
            <el-radio value="wechat">微信</el-radio>
            <el-radio value="alipay">支付宝</el-radio>
            <el-radio value="bank">银行转账</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="退货原因">
          <el-input v-model="returnForm.reason" type="textarea" :rows="3" placeholder="请输入退货原因" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="returnForm.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="returnDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitReturn">确认退货</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="退货单详情" width="800px" destroy-on-close>
      <el-descriptions :column="2" border v-if="currentReturn">
        <el-descriptions-item label="退货单号">{{ currentReturn.returnNo }}</el-descriptions-item>
        <el-descriptions-item label="原单号">{{ currentReturn.originalOrderNo }}</el-descriptions-item>
        <el-descriptions-item label="退货日期">{{ currentReturn.returnDate }}</el-descriptions-item>
        <el-descriptions-item label="客户名称">{{ currentReturn.customerName }}</el-descriptions-item>
        <el-descriptions-item label="退货金额">
          <span style="color: #F56C6C; font-weight: 600">¥{{ currentReturn.returnAmount.toLocaleString() }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="退款方式">{{ currentReturn.refundMethod }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentReturn.status)">{{ currentReturn.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作员">{{ currentReturn.operator }}</el-descriptions-item>
        <el-descriptions-item label="退货原因" :span="2">{{ currentReturn.reason }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentReturn.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <el-divider>退货商品明细</el-divider>
      
      <el-table :data="currentReturn?.items || []" size="small">
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="originalQuantity" label="原数量" width="80" align="center" />
        <el-table-column prop="returnQuantity" label="退货数量" width="80" align="center" />
        <el-table-column prop="price" label="单价" width="100" align="right">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="returnAmount" label="退货金额" width="120" align="right">
          <template #default="{ row }">¥{{ row.returnAmount.toLocaleString() }}</template>
        </el-table-column>
      </el-table>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handlePrintDetail">打印</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const searchForm = reactive({
  originalOrderNo: '',
  dateRange: []
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(3)
const returnDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentReturn = ref(null)

const returnForm = reactive({
  originalOrderNo: '',
  customerName: '',
  returnDate: new Date().toISOString().slice(0, 10),
  items: [],
  refundMethod: 'wechat',
  reason: '',
  remark: ''
})

const returnList = reactive([
  { 
    returnNo: 'RR20240515001', 
    originalOrderNo: 'RO20240514008', 
    returnDate: '2024-05-15', 
    customerName: '深圳市科技有限公司',
    productCount: 2,
    returnAmount: 3000,
    refundMethod: '微信退款',
    status: '已退款',
    operator: '张三',
    reason: '客户要求退货',
    items: []
  },
  { 
    returnNo: 'RR20240515002', 
    originalOrderNo: 'RO20240514012', 
    returnDate: '2024-05-15', 
    customerName: '广州市软件企业',
    productCount: 1,
    returnAmount: 899,
    refundMethod: '现金退款',
    status: '已退款',
    operator: '李四',
    reason: '商品质量问题',
    items: []
  },
  { 
    returnNo: 'RR20240515003', 
    originalOrderNo: 'RO20240514015', 
    returnDate: '2024-05-15', 
    customerName: '东莞市网络公司',
    productCount: 3,
    returnAmount: 5800,
    refundMethod: '银行转账',
    status: '处理中',
    operator: '王五',
    reason: '重复购买',
    items: []
  }
])

const totalReturnAmount = computed(() => {
  return returnForm.items.reduce((sum, item) => sum + item.price * item.returnQuantity, 0)
})

const getStatusType = (status) => {
  const typeMap = {
    '已退款': 'success',
    '处理中': 'warning',
    '已取消': 'info'
  }
  return typeMap[status] || ''
}

const handleSearch = () => {
  ElMessage.success('查询成功')
}

const handleReset = () => {
  searchForm.originalOrderNo = ''
  searchForm.dateRange = []
}

const viewOriginalOrder = (row) => {
  ElMessage.info(`查看原单: ${row.originalOrderNo}`)
}

const handleView = (row) => {
  currentReturn.value = row
  detailDialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除退货单 ${row.returnNo} 吗?`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = returnList.findIndex(item => item.returnNo === row.returnNo)
    if (index > -1) {
      returnList.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const loadOriginalOrder = () => {
  if (!returnForm.originalOrderNo) {
    ElMessage.warning('请输入原单号')
    return
  }
  returnForm.customerName = '深圳市科技有限公司'
  returnForm.items = [
    { productName: 'Office 365 商业版', originalQuantity: 2, returnQuantity: 1, price: 1999, returnAmount: 1999 },
    { productName: '金山文档企业版', originalQuantity: 1, returnQuantity: 1, price: 899, returnAmount: 899 }
  ]
  ElMessage.success('已加载原单商品')
}

const removeReturnItem = (index) => {
  returnForm.items.splice(index, 1)
}

const handleSubmitReturn = () => {
  if (returnForm.items.length === 0) {
    ElMessage.warning('请添加退货商品')
    return
  }
  if (!returnForm.reason) {
    ElMessage.warning('请输入退货原因')
    return
  }
  
  ElMessageBox.confirm(`确认退货，总金额 ¥${totalReturnAmount.value.toLocaleString()}?`, '确认退货', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('退货单已保存')
    returnDialogVisible.value = false
    returnForm.originalOrderNo = ''
    returnForm.customerName = ''
    returnForm.items = []
    returnForm.reason = ''
    returnForm.remark = ''
  }).catch(() => {})
}

const handlePrintDetail = () => {
  ElMessage.success('正在打印...')
}
</script>

<style scoped>
.retail-return-page {
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

.return-amount {
  color: #F56C6C;
  font-weight: 600;
}

.return-summary {
  text-align: right;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
  margin-top: 15px;
  font-size: 16px;
}

.return-summary .amount {
  font-size: 24px;
  font-weight: 700;
  color: #F56C6C;
  margin-left: 10px;
}
</style>
