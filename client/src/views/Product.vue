<template>
  <div class="product-page">
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">商品列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreate"><el-icon><Plus /></el-icon>新建商品</el-button>
          </div>
        </div>
      </template>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="商品名称"><el-input v-model="searchForm.name" placeholder="请输入商品名称" clearable /></el-form-item>
        <el-form-item label="商品编码"><el-input v-model="searchForm.code" placeholder="请输入商品编码" clearable /></el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.categoryId" placeholder="选择分类" clearable style="width: 150px">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>查询</el-button><el-button @click="handleReset">重置</el-button></el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="productList" stripe style="width: 100%">
        <el-table-column prop="code" label="商品编码" width="140" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="categoryName" label="分类" width="120" />
        <el-table-column prop="specification" label="规格" width="120" />
        <el-table-column prop="unit" label="单位" width="70" align="center" />
        <el-table-column prop="purchasePrice" label="采购价" width="100" align="right"><template #default="{ row }">¥{{ row.purchasePrice }}</template></el-table-column>
        <el-table-column prop="salePrice" label="销售价" width="100" align="right"><template #default="{ row }">¥{{ row.salePrice }}</template></el-table-column>
        <el-table-column prop="stock" label="库存" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="80" align="center"><template #default="{ row }"><el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">{{ row.status === 'active' ? '启用' : '禁用' }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" /></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'

const searchForm = reactive({ name: '', code: '', categoryId: '' })
const currentPage = ref(1), pageSize = ref(10), total = ref(6)
const categories = reactive([{ id: 1, name: '软件产品' }, { id: 2, name: '服务类' }, { id: 3, name: '硬件设备' }])
const productList = reactive([
  { id: 1, code: 'SOFT001', name: 'Office 365 商业版', categoryName: '软件产品', specification: '年订阅', unit: '套', purchasePrice: 1999, salePrice: 2199, stock: 50, status: 'active' },
  { id: 2, code: 'SOFT002', name: 'Adobe Creative Cloud', categoryName: '软件产品', specification: '年订阅', unit: '套', purchasePrice: 2999, salePrice: 3299, stock: 30, status: 'active' },
  { id: 3, code: 'SOFT003', name: '金山文档企业版', categoryName: '软件产品', specification: '年订阅', unit: '套', purchasePrice: 899, salePrice: 999, stock: 100, status: 'active' },
  { id: 4, code: 'SOFT004', name: '用友U8软件', categoryName: '软件产品', specification: '标准版', unit: '套', purchasePrice: 5800, salePrice: 6800, stock: 20, status: 'active' },
  { id: 5, code: 'HARD001', name: 'ThinkPad笔记本', categoryName: '硬件设备', specification: 'T14', unit: '台', purchasePrice: 5999, salePrice: 6999, stock: 15, status: 'active' },
  { id: 6, code: 'HARD002', name: 'Dell显示器27寸', categoryName: '硬件设备', specification: 'U2720Q', unit: '台', purchasePrice: 1599, salePrice: 1899, stock: 35, status: 'active' }
])

const handleSearch = () => ElMessage.success('查询成功')
const handleReset = () => { searchForm.name = ''; searchForm.code = ''; searchForm.categoryId = '' }
const handleCreate = () => ElMessage.info('新建商品功能开发中')
const handleEdit = (row) => ElMessage.info(`编辑商品: ${row.name}`)
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除商品 ${row.name} 吗?`, '删除确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    .then(() => { const idx = productList.findIndex(p => p.id === row.id); if (idx > -1) { productList.splice(idx, 1); ElMessage.success('删除成功') } })
    .catch(() => {})
}
</script>

<style scoped>
.product-page { padding: 0; }
.search-card, .table-card { border-radius: 8px; margin-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 16px; font-weight: 600; color: #303133; }
.pagination-container { display: flex; justify-content: flex-end; margin-top: 20px; }
</style>
