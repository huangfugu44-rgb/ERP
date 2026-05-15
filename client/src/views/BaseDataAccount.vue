<template>
  <div class="account-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="card-title">账户列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreate"><el-icon><Plus /></el-icon>新建账户</el-button>
          </div>
        </div>
      </template>
      <el-table :data="accountList" stripe style="width: 100%">
        <el-table-column prop="name" label="账户名称" />
        <el-table-column prop="accountNo" label="账户号码" width="180" />
        <el-table-column prop="bankName" label="开户银行" width="180" />
        <el-table-column prop="balance" label="账户余额" width="140" align="right"><template #default="{ row }"><strong>¥{{ row.balance.toLocaleString() }}</strong></template></el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center"><template #default="{ row }"><el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">{{ row.status === 'active' ? '启用' : '禁用' }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const accountList = reactive([
  { id: 1, name: '中国银行基本户', accountNo: '621700******4567', bankName: '中国银行深圳分行', balance: 1256800, status: 'active' },
  { id: 2, name: '工商银行一般户', accountNo: '622202******8901', bankName: '工商银行深圳分行', balance: 856300, status: 'active' },
  { id: 3, name: '建设银行一般户', accountNo: '621700******2345', bankName: '建设银行深圳分行', balance: 523100, status: 'active' },
  { id: 4, name: '现金账户', accountNo: 'CASH', bankName: '-', balance: 15800, status: 'active' }
])

const handleCreate = () => ElMessage.info('新建账户功能开发中')
const handleEdit = (row) => ElMessage.info(`编辑账户: ${row.name}`)
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除账户 ${row.name} 吗?`, '删除确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    .then(() => { const idx = accountList.findIndex(a => a.id === row.id); if (idx > -1) { accountList.splice(idx, 1); ElMessage.success('删除成功') } })
    .catch(() => {})
}
</script>

<style scoped>
.account-page { padding: 0; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 16px; font-weight: 600; color: #303133; }
</style>
