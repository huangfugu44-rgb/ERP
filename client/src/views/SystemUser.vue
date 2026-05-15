<template>
  <div class="system-user-page">
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">用户列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreate"><el-icon><Plus /></el-icon>新建用户</el-button>
          </div>
        </div>
      </template>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户名"><el-input v-model="searchForm.username" placeholder="请输入用户名" clearable /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>查询</el-button><el-button @click="handleReset">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card class="table-card">
      <el-table :data="userList" stripe style="width: 100%">
        <el-table-column prop="username" label="用户名" width="140" />
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="role" label="角色" width="120" align="center" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="lastLogin" label="最后登录" width="160" />
        <el-table-column prop="status" label="状态" width="80" align="center"><template #default="{ row }"><el-switch v-model="row.status" active-text="" inactive-text="" /></template></el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="handleResetPwd(row)">重置密码</el-button>
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

const searchForm = reactive({ username: '' })
const currentPage = ref(1), pageSize = ref(10), total = ref(5)
const userList = reactive([
  { id: 1, username: 'admin', realName: '系统管理员', email: 'admin@aierp.com', role: '超级管理员', department: '信息中心', lastLogin: '2024-05-15 10:30', status: true },
  { id: 2, username: 'zhangsan', realName: '张三', email: 'zhangsan@aierp.com', role: '销售主管', department: '销售部', lastLogin: '2024-05-15 09:15', status: true },
  { id: 3, username: 'lisi', realName: '李四', email: 'lisi@aierp.com', role: '采购主管', department: '采购部', lastLogin: '2024-05-14 18:20', status: true },
  { id: 4, username: 'wangwu', realName: '王五', email: 'wangwu@aierp.com', role: '仓库管理员', department: '仓储部', lastLogin: '2024-05-15 08:45', status: true },
  { id: 5, username: 'zhaoliu', realName: '赵六', email: 'zhaoliu@aierp.com', role: '财务主管', department: '财务部', lastLogin: '2024-05-14 17:30', status: true }
])

const handleSearch = () => ElMessage.success('查询成功')
const handleReset = () => { searchForm.username = '' }
const handleCreate = () => ElMessage.info('新建用户功能开发中')
const handleEdit = (row) => ElMessage.info(`编辑用户: ${row.username}`)
const handleResetPwd = (row) => { ElMessageBox.confirm(`确定要重置用户 ${row.username} 的密码吗?`, '重置密码', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => ElMessage.success('密码已重置为: 123456')).catch(() => {}) }
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除用户 ${row.username} 吗?`, '删除确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    .then(() => { const idx = userList.findIndex(u => u.id === row.id); if (idx > -1) { userList.splice(idx, 1); ElMessage.success('删除成功') } })
    .catch(() => {})
}
</script>

<style scoped>
.system-user-page { padding: 0; }
.search-card, .table-card { border-radius: 8px; margin-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 16px; font-weight: 600; color: #303133; }
.pagination-container { display: flex; justify-content: flex-end; margin-top: 20px; }
</style>
