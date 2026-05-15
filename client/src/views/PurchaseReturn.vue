<template>
  <div class="purchase-return-page">
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">采购退货</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              新建退货单
            </el-button>
          </div>
        </div>
      </template>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="退货单号">
          <el-input v-model="searchForm.returnNo" placeholder="请输入单号" clearable />
        </el-form-item>
        <el-form-item label="原入库单号">
          <el-input v-model="searchForm.inboundNo" placeholder="请输入原入库单号" clearable />
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
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="待处理" value="pending" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
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
      <el-table :data="returnList" stripe style="width: 100%">
        <el-table-column prop="returnNo" label="退货单号" width="180" />
        <el-table-column prop="inboundNo" label="原入库单号" width="180">
          <template #default="{ row }">
            <el-button link @click="viewInbound(row)">{{ row.inboundNo }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="returnDate" label="退货日期" width="120" />
        <el-table-column prop="supplierName" label="供应商" />
        <el-table-column prop="warehouseName" label="退货仓库" width="120" />
        <el-table-column prop="productCount" label="商品种数" width="80" align="center" />
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
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
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

    <el-dialog v-model="formDialogVisible" title="新建退货单" width="900px" destroy-on-close>
      <el-form :model="returnForm" :rules="returnRules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="原入库单" prop="inboundNo">
              <el-input v-model="returnForm.inboundNo" placeholder="请输入或扫描入库单号">
                <template #append>
                  <el-button @click="loadInbound">加载</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="退货日期" prop="returnDate">
              <el-date-picker
                v-model="returnForm.returnDate"
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
              <el-input v-model="returnForm.supplierName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="退货仓库" prop="warehouseId">
              <el-select v-model="returnForm.warehouseId" placeholder="请选择仓库" style="width: 100%">
                <el-option v-for="warehouse in warehouses" :key="warehouse.id" :label="warehouse.name" :value="warehouse.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <el-divider>退货商品</el-divider>
      
      <el-table :data="returnForm.items" size="small">
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="specification" label="规格" width="100" />
        <el-table-column prop="unit" label="单位" width="60" align="center" />
        <el-table-column prop="inboundQuantity" label="入库数量" width="90" align="center" />
        <el-table-column prop="returnQuantity" label="退货数量" width="120" align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.returnQuantity" :min="0" :max="row.availableReturn" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="price" label="单价" width="100" align="right">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="100" align="right">
          <template #default="{ row }">¥{{ (row.price * row.returnQuantity).toLocaleString() }}</template>
        </el-table-column>
      </el-table>
      
      <div class="return-summary">
        <span>退货总数量: {{ totalQuantity }} | </span>
        <span>退货总金额: <strong>-¥{{ totalAmount.toLocaleString() }}</strong></span>
      </div>
      
      <el-form :model="returnForm" label-width="100px" style="margin-top: 20px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="退款方式">
              <el-radio-group v-model="returnForm.refundMethod">
                <el-radio value="bank">银行转账</el-radio>
                <el-radio value="cash">现金</el-radio>
                <el-radio value="offset">抵扣货款</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="退货原因">
          <el-input v-model="returnForm.reason" type="textarea" :rows="2" placeholder="请输入退货原因" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="returnForm.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认退货</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="退货单详情" width="900px" destroy-on-close>
      <el-descriptions :column="2" border v-if="currentReturn">
        <el-descriptions-item label="退货单号">{{ currentReturn.returnNo }}</el-descriptions-item>
        <el-descriptions-item label="原入库单">{{ currentReturn.inboundNo }}</el-descriptions-item>
        <el-descriptions-item label="退货日期">{{ currentReturn.returnDate }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ currentReturn.supplierName }}</el-descriptions-item>
        <el-descriptions-item label="退货仓库">{{ currentReturn.warehouseName }}</el-descriptions-item>
        <el-descriptions-item label="退货金额">
          <strong style="color: #F56C6C">-¥{{ currentReturn.returnAmount.toLocaleString() }}</strong>
        </el-descriptions-item>
        <el-descriptions-item label="退款方式">{{ currentReturn.refundMethod }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentReturn.status)">{{ currentReturn.statusText }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="退货原因" :span="2">{{ currentReturn.reason }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentReturn.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <el-divider>退货商品明细</el-divider>
      
      <el-table :data="currentReturn?.items || []" size="small">
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="specification" label="规格" width="100" />
        <el-table-column prop="unit" label="单位" width="60" align="center" />
        <el-table-column prop="returnQuantity" label="退货数量" width="80" align="center" />
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
  returnNo: '',
  inboundNo: '',
  dateRange: [],
  status: ''
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(3)
const formDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const formRef = ref(null)
const currentReturn = ref(null)

const returnForm = reactive({
  inboundNo: '',
  supplierName: '',
  warehouseId: '',
  returnDate: new Date().toISOString().slice(0, 10),
  items: [],
  refundMethod: 'bank',
  reason: '',
  remark: ''
})

const returnRules = {
  inboundNo: [{ required: true, message: '请输入入库单号', trigger: 'blur' }],
  returnDate: [{ required: true, message: '请选择退货日期', trigger: 'change' }]
}

const warehouses = reactive([
  { id: 1, name: '主仓库' },
  { id: 2, name: '软件仓库' },
  { id: 3, name: '硬件仓库' }
])

const returnList = reactive([
  { returnNo: 'PR20240515001', inboundNo: 'PI20240510001', returnDate: '2024-05-15', supplierName: '微软(中国)有限公司', warehouseName: '软件仓库', productCount: 1, returnAmount: 5999, refundMethod: '银行转账', status: 'completed', statusText: '已完成', items: [] },
  { returnNo: 'PR20240510002', inboundNo: 'PI20240508002', returnDate: '2024-05-10', supplierName: 'Adobe公司', warehouseName: '软件仓库', productCount: 2, returnAmount: 4500, refundMethod: '抵扣货款', status: 'completed', statusText: '已完成', items: [] },
  { returnNo: 'PR20240505003', inboundNo: 'PI20240503003', returnDate: '2024-05-05', supplierName: '金山软件股份', warehouseName: '软件仓库', productCount: 1, returnAmount: 899, refundMethod: '现金', status: 'cancelled', statusText: '已取消', items: [] }
])

const totalQuantity = computed(() => {
  return returnForm.items.reduce((sum, item) => sum + item.returnQuantity, 0)
})

const totalAmount = computed(() => {
  return returnForm.items.reduce((sum, item) => sum + item.price * item.returnQuantity, 0)
})

const getStatusType = (status) => {
  const typeMap = { pending: 'warning', completed: 'success', cancelled: 'info' }
  return typeMap[status] || ''
}

const handleSearch = () => ElMessage.success('查询成功')
const handleReset = () => {
  searchForm.returnNo = ''
  searchForm.inboundNo = ''
  searchForm.dateRange = []
  searchForm.status = ''
}

const handleCreate = () => {
  returnForm.inboundNo = ''
  returnForm.supplierName = ''
  returnForm.warehouseId = ''
  returnForm.items = []
  returnForm.refundMethod = 'bank'
  returnForm.reason = ''
  returnForm.remark = ''
  formDialogVisible.value = true
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

const loadInbound = () => {
  if (!returnForm.inboundNo) {
    ElMessage.warning('请输入入库单号')
    return
  }
  returnForm.supplierName = '微软(中国)有限公司'
  returnForm.items = [
    { productName: 'Office 365 商业版', specification: '年订阅', unit: '套', inboundQuantity: 30, returnQuantity: 3, availableReturn: 5, price: 1999 },
    { productName: 'Microsoft 365 E3', specification: '年订阅', unit: '套', inboundQuantity: 20, returnQuantity: 0, availableReturn: 2, price: 1200 }
  ]
  ElMessage.success('已加载入库单商品')
}

const viewInbound = (row) => ElMessage.info(`查看入库单: ${row.inboundNo}`)
const handlePrint = () => ElMessage.success('正在打印...')

const handleSubmit = () => {
  if (!returnForm.warehouseId) {
    ElMessage.warning('请选择仓库')
    return
  }
  if (!returnForm.reason) {
    ElMessage.warning('请输入退货原因')
    return
  }
  const hasReturn = returnForm.items.some(item => item.returnQuantity > 0)
  if (!hasReturn) {
    ElMessage.warning('请输入退货数量')
    return
  }
  ElMessageBox.confirm(`确认退货，总数量 ${totalQuantity.value}，总金额 ¥${totalAmount.value.toLocaleString()}?`, '确认退货', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('退货单已保存')
    formDialogVisible.value = false
  }).catch(() => {})
}
</script>

<style scoped>
.purchase-return-page {
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
  font-weight: 600;
  color: #F56C6C;
}

.return-summary {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
  text-align: right;
  font-size: 14px;
  margin-top: 15px;
}

.return-summary strong {
  color: #F56C6C;
  font-size: 16px;
}
</style>
