<template>
  <div class="warehouse-manage-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="card-title">仓库列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreate"><el-icon><Plus /></el-icon>新建仓库</el-button>
          </div>
        </div>
      </template>
      <el-table :data="warehouseList" stripe style="width: 100%">
        <el-table-column prop="code" label="仓库编码" width="140" />
        <el-table-column prop="name" label="仓库名称" />
        <el-table-column prop="address" label="仓库地址" />
        <el-table-column prop="manager" label="负责人" width="100" />
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column prop="productCount" label="商品种类" width="100" align="center" />
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

const warehouseList = reactive([
  { id: 1, code: 'WH001', name: '主仓库', address: '深圳市南山区', manager: '张三', phone: '0755-88888888', productCount: 120, status: 'active' },
  { id: 2, code: 'WH002', name: '软件仓库', address: '深圳市福田区', manager: '李四', phone: '0755-88888889', productCount: 45, status: 'active' },
  { id: 3, code: 'WH003', name: '硬件仓库', address: '深圳市宝安区', manager: '王五', phone: '0755-88888890', productCount: 35, status: 'active' }
])

const handleCreate = () => ElMessage.info('新建仓库功能开发中')
const handleEdit = (row) => ElMessage.info(`编辑仓库: ${row.name}`)
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除仓库 ${row.name} 吗?`, '删除确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    .then(() => { const idx = warehouseList.findIndex(w => w.id === row.id); if (idx > -1) { warehouseList.splice(idx, 1); ElMessage.success('删除成功') } })
    .catch(() => {})
}
</script>

<style scoped>
.warehouse-manage-page { padding: 0; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 16px; font-weight: 600; color: #303133; }
</style>
