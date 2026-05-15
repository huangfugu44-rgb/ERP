<template>
  <div class="customer-page">
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">客户列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreate"><el-icon><Plus /></el-icon>新建客户</el-button>
          </div>
        </div>
      </template>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="客户名称"><el-input v-model="searchForm.name" placeholder="请输入客户名称" clearable /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>查询</el-button><el-button @click="handleReset">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card class="table-card">
      <el-table :data="customerList" stripe style="width: 100%">
        <el-table-column prop="code" label="客户编码" width="140" />
        <el-table-column prop="name" label="客户名称" />
        <el-table-column prop="contact" label="联系人" width="100" />
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column prop="receivable" label="应收余额" width="120" align="right"><template #default="{ row }">¥{{ row.receivable.toLocaleString() }}</template></el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center"><template #default="{ row }"><el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">{{ row.status === 'active' ? '启用' : '禁用' }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper" /></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'

const searchForm = reactive({ name: '' })
const currentPage = ref(1), pageSize = ref(10), total = ref(5)
const customerList = reactive([
  { id: 1, code: 'CUS001', name: '深圳市科技有限公司', contact: '张经理', phone: '0755-12345678', receivable: 58000, status: 'active' },
  { id: 2, code: 'CUS002', name: '广州市软件企业', contact: '李经理', phone: '020-23456789', receivable: 32000, status: 'active' },
  { id: 3, code: 'CUS003', name: '东莞市网络公司', contact: '王经理', phone: '0769-34567890', receivable: 18500, status: 'active' },
  { id: 4, code: 'CUS004', name: '佛山市信息科技', contact: '赵经理', phone: '0757-45678901', receivable: 45000, status: 'active' },
  { id: 5, code: 'CUS005', name: '惠州市电子集团', contact: '刘经理', phone: '0752-56789012', receivable: 68000, status: 'active' }
])

const handleSearch = () => ElMessage.success('查询成功')
const handleReset = () => { searchForm.name = '' }
const handleCreate = () => ElMessage.info('新建客户功能开发中')
const handleEdit = (row) => ElMessage.info(`编辑客户: ${row.name}`)
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除客户 ${row.name} 吗?`, '删除确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    .then(() => { const idx = customerList.findIndex(c => c.id === row.id); if (idx > -1) { customerList.splice(idx, 1); ElMessage.success('删除成功') } })
    .catch(() => {})
}
</script>

<style scoped>
.customer-page { padding: 0; }
.search-card, .table-card { border-radius: 8px; margin-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 16px; font-weight: 600; color: #303133; }
.pagination-container { display: flex; justify-content: flex-end; margin-top: 20px; }
</style>
