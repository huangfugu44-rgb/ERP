<template>
  <div class="system-role-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="card-title">角色列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreate"><el-icon><Plus /></el-icon>新建角色</el-button>
          </div>
        </div>
      </template>
      <el-table :data="roleList" stripe style="width: 100%">
        <el-table-column prop="name" label="角色名称" width="140" />
        <el-table-column prop="code" label="角色编码" width="140" />
        <el-table-column prop="description" label="角色描述" />
        <el-table-column prop="userCount" label="用户数" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="80" align="center"><template #default="{ row }"><el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">{{ row.status === 'active' ? '启用' : '禁用' }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="handlePermission(row)">权限</el-button>
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

const roleList = reactive([
  { id: 1, name: '超级管理员', code: 'SUPER_ADMIN', description: '拥有系统所有权限', userCount: 1, status: 'active' },
  { id: 2, name: '销售主管', code: 'SALES_MANAGER', description: '管理销售相关业务', userCount: 2, status: 'active' },
  { id: 3, name: '采购主管', code: 'PURCHASE_MANAGER', description: '管理采购相关业务', userCount: 1, status: 'active' },
  { id: 4, name: '仓库管理员', code: 'WAREHOUSE_ADMIN', description: '管理仓库和库存', userCount: 2, status: 'active' },
  { id: 5, name: '财务主管', code: 'FINANCE_MANAGER', description: '管理财务相关业务', userCount: 1, status: 'active' }
])

const handleCreate = () => ElMessage.info('新建角色功能开发中')
const handleEdit = (row) => ElMessage.info(`编辑角色: ${row.name}`)
const handlePermission = (row) => ElMessage.info(`配置权限: ${row.name}`)
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除角色 ${row.name} 吗?`, '删除确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    .then(() => { const idx = roleList.findIndex(r => r.id === row.id); if (idx > -1) { roleList.splice(idx, 1); ElMessage.success('删除成功') } })
    .catch(() => {})
}
</script>

<style scoped>
.system-role-page { padding: 0; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 16px; font-weight: 600; color: #303133; }
</style>
