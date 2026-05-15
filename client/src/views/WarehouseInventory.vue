<template>
  <div class="warehouse-inventory-page">
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">库存查询</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleExport">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </div>
      </template>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.productName" placeholder="请输入商品名称" clearable />
        </el-form-item>
        <el-form-item label="商品编码">
          <el-input v-model="searchForm.productCode" placeholder="请输入商品编码" clearable />
        </el-form-item>
        <el-form-item label="仓库">
          <el-select v-model="searchForm.warehouseId" placeholder="选择仓库" clearable style="width: 150px">
            <el-option label="全部仓库" value="" />
            <el-option v-for="warehouse in warehouses" :key="warehouse.id" :label="warehouse.name" :value="warehouse.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="库存状态">
          <el-select v-model="searchForm.stockStatus" placeholder="选择状态" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="正常" value="normal" />
            <el-option label="不足" value="low" />
            <el-option label="积压" value="high" />
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
      <el-table :data="inventoryList" stripe style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="productCode" label="商品编码" width="140" />
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="specification" label="规格" width="120" />
        <el-table-column prop="unit" label="单位" width="70" align="center" />
        <el-table-column prop="warehouseName" label="仓库" width="100" />
        <el-table-column prop="quantity" label="库存数量" width="100" align="center">
          <template #default="{ row }">
            <span :class="{ 'low-stock': row.quantity <= row.minStock, 'high-stock': row.quantity >= row.maxStock * 0.9 }">
              {{ row.quantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="minStock" label="最低库存" width="100" align="center" />
        <el-table-column prop="maxStock" label="最高库存" width="100" align="center" />
        <el-table-column prop="unitPrice" label="单价" width="100" align="right">
          <template #default="{ row }">
            ¥{{ row.unitPrice.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="库存金额" width="120" align="right">
          <template #default="{ row }">
            <strong>¥{{ row.totalAmount.toLocaleString() }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row)" size="small">{{ getStatusText(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">详情</el-button>
            <el-button link type="warning" @click="handleAdjust(row)">调整</el-button>
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

    <el-dialog v-model="detailDialogVisible" title="库存详情" width="700px" destroy-on-close>
      <el-descriptions :column="2" border v-if="currentInventory">
        <el-descriptions-item label="商品编码">{{ currentInventory.productCode }}</el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ currentInventory.productName }}</el-descriptions-item>
        <el-descriptions-item label="规格">{{ currentInventory.specification }}</el-descriptions-item>
        <el-descriptions-item label="单位">{{ currentInventory.unit }}</el-descriptions-item>
        <el-descriptions-item label="仓库">{{ currentInventory.warehouseName }}</el-descriptions-item>
        <el-descriptions-item label="当前库存">{{ currentInventory.quantity }}</el-descriptions-item>
        <el-descriptions-item label="最低库存">{{ currentInventory.minStock }}</el-descriptions-item>
        <el-descriptions-item label="最高库存">{{ currentInventory.maxStock }}</el-descriptions-item>
        <el-descriptions-item label="单价">¥{{ currentInventory.unitPrice.toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="库存金额">
          <strong style="color: #67C23A">¥{{ currentInventory.totalAmount.toLocaleString() }}</strong>
        </el-descriptions-item>
      </el-descriptions>
      
      <el-divider>库存变动记录</el-divider>
      
      <el-table :data="currentInventory?.records || []" size="small" max-height="300">
        <el-table-column prop="recordDate" label="日期" width="120" />
        <el-table-column prop="changeType" label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.changeType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="changeQuantity" label="变化数量" width="100" align="center">
          <template #default="{ row }">
            <span :class="row.changeQuantity > 0 ? 'positive' : 'negative'">
              {{ row.changeQuantity > 0 ? '+' : '' }}{{ row.changeQuantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="beforeStock" label="变动前" width="80" align="center" />
        <el-table-column prop="afterStock" label="变动后" width="80" align="center" />
        <el-table-column prop="remark" label="单据编号" />
      </el-table>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="adjustDialogVisible" title="库存调整" width="500px" destroy-on-close>
      <el-form :model="adjustForm" :rules="adjustRules" ref="formRef" label-width="100px">
        <el-form-item label="商品">
          <el-input v-model="adjustForm.productName" disabled />
        </el-form-item>
        <el-form-item label="仓库">
          <el-input v-model="adjustForm.warehouseName" disabled />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input v-model="adjustForm.currentStock" disabled />
        </el-form-item>
        <el-form-item label="调整类型" prop="adjustType">
          <el-radio-group v-model="adjustForm.adjustType">
            <el-radio value="increase">增加</el-radio>
            <el-radio value="decrease">减少</el-radio>
            <el-radio value="set">设置为</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="调整数量" prop="adjustQuantity" v-if="adjustForm.adjustType !== 'set'">
          <el-input-number v-model="adjustForm.adjustQuantity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="调整后数量" prop="newStock" v-if="adjustForm.adjustType === 'set'">
          <el-input-number v-model="adjustForm.newStock" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="调整原因" prop="reason">
          <el-input v-model="adjustForm.reason" type="textarea" :rows="3" placeholder="请输入调整原因" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="adjustDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitAdjust">确认调整</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Download } from '@element-plus/icons-vue'

const searchForm = reactive({
  productName: '',
  productCode: '',
  warehouseId: '',
  stockStatus: ''
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(6)
const detailDialogVisible = ref(false)
const adjustDialogVisible = ref(false)
const formRef = ref(null)
const currentInventory = ref(null)
const selectedRows = ref([])

const adjustForm = reactive({
  productName: '',
  warehouseName: '',
  currentStock: 0,
  adjustType: 'increase',
  adjustQuantity: 1,
  newStock: 0,
  reason: ''
})

const adjustRules = {
  adjustType: [{ required: true, message: '请选择调整类型', trigger: 'change' }],
  reason: [{ required: true, message: '请输入调整原因', trigger: 'blur' }]
}

const warehouses = reactive([
  { id: 1, name: '主仓库' },
  { id: 2, name: '软件仓库' },
  { id: 3, name: '硬件仓库' }
])

const inventoryList = reactive([
  { id: 1, productCode: 'SOFT001', productName: 'Office 365 商业版', specification: '年订阅', unit: '套', warehouseName: '软件仓库', quantity: 50, minStock: 10, maxStock: 100, unitPrice: 1999, totalAmount: 99950, records: [] },
  { id: 2, productCode: 'SOFT002', productName: 'Adobe Creative Cloud', specification: '年订阅', unit: '套', warehouseName: '软件仓库', quantity: 25, minStock: 15, maxStock: 80, unitPrice: 2999, totalAmount: 74975, records: [] },
  { id: 3, productCode: 'SOFT003', productName: '金山文档企业版', specification: '年订阅', unit: '套', warehouseName: '软件仓库', quantity: 120, minStock: 20, maxStock: 200, unitPrice: 899, totalAmount: 107880, records: [] },
  { id: 4, productCode: 'SOFT004', productName: '用友U8软件', specification: '标准版', unit: '套', warehouseName: '软件仓库', quantity: 23, minStock: 10, maxStock: 50, unitPrice: 5800, totalAmount: 133400, records: [] },
  { id: 5, productCode: 'HARD001', productName: 'ThinkPad笔记本', specification: 'T14', unit: '台', warehouseName: '硬件仓库', quantity: 7, minStock: 5, maxStock: 30, unitPrice: 5999, totalAmount: 41993, records: [] },
  { id: 6, productCode: 'HARD002', productName: 'Dell显示器27寸', specification: 'U2720Q', unit: '台', warehouseName: '硬件仓库', quantity: 35, minStock: 20, maxStock: 60, unitPrice: 1599, totalAmount: 55965, records: [] }
])

const getStatusType = (row) => {
  if (row.quantity <= row.minStock) return 'danger'
  if (row.quantity >= row.maxStock * 0.9) return 'warning'
  return 'success'
}

const getStatusText = (row) => {
  if (row.quantity <= row.minStock) return '不足'
  if (row.quantity >= row.maxStock * 0.9) return '积压'
  return '正常'
}

const handleSearch = () => ElMessage.success('查询成功')
const handleReset = () => {
  searchForm.productName = ''
  searchForm.productCode = ''
  searchForm.warehouseId = ''
  searchForm.stockStatus = ''
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handleView = (row) => {
  currentInventory.value = row
  detailDialogVisible.value = true
}

const handleAdjust = (row) => {
  adjustForm.productName = row.productName
  adjustForm.warehouseName = row.warehouseName
  adjustForm.currentStock = row.quantity
  adjustForm.adjustType = 'increase'
  adjustForm.adjustQuantity = 1
  adjustForm.newStock = row.quantity
  adjustForm.reason = ''
  adjustDialogVisible.value = true
}

const handleSubmitAdjust = () => {
  if (!adjustForm.reason) {
    ElMessage.warning('请输入调整原因')
    return
  }
  ElMessageBox.confirm('确认调整库存?', '库存调整', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('库存调整成功')
    adjustDialogVisible.value = false
  }).catch(() => {})
}

const handleExport = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要导出的数据')
    return
  }
  ElMessage.success(`已选择 ${selectedRows.value.length} 条数据导出`)
}
</script>

<style scoped>
.warehouse-inventory-page {
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

.low-stock {
  color: #F56C6C;
  font-weight: 600;
}

.high-stock {
  color: #E6A23C;
  font-weight: 600;
}

.positive {
  color: #67C23A;
  font-weight: 600;
}

.negative {
  color: #F56C6C;
  font-weight: 600;
}
</style>
