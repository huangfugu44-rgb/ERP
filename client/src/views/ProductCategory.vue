<template>
  <div class="product-category-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="card-title">商品分类</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreate"><el-icon><Plus /></el-icon>新建分类</el-button>
          </div>
        </div>
      </template>
      <el-table :data="categoryList" row-key="id" default-expand-all stripe style="width: 100%">
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="code" label="分类编码" width="150" />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="productCount" label="商品数量" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="80" align="center"><template #default="{ row }"><el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">{{ row.status === 'active' ? '启用' : '禁用' }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="150" align="center">
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
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const categoryList = reactive([
  { id: 1, name: '软件产品', code: 'SOFT', sort: 1, productCount: 45, status: 'active', children: [{ id: 11, name: '办公软件', code: 'SOFT01', sort: 1, productCount: 20, status: 'active' }, { id: 12, name: '设计软件', code: 'SOFT02', sort: 2, productCount: 15, status: 'active' }] },
  { id: 2, name: '服务类', code: 'SERVICE', sort: 2, productCount: 30, status: 'active' },
  { id: 3, name: '硬件设备', code: 'HARD', sort: 3, productCount: 25, status: 'active' },
  { id: 4, name: '其他', code: 'OTHER', sort: 4, productCount: 10, status: 'active' }
])

const handleCreate = () => ElMessage.info('新建分类功能开发中')
const handleEdit = (row) => ElMessage.info(`编辑分类: ${row.name}`)
const handleDelete = (row) => {
  if (row.children && row.children.length > 0) { ElMessage.warning('请先删除子分类'); return }
  ElMessageBox.confirm(`确定要删除分类 ${row.name} 吗?`, '删除确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    .then(() => ElMessage.success('删除成功'))
    .catch(() => {})
}
</script>

<style scoped>
.product-category-page { padding: 0; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 16px; font-weight: 600; color: #303133; }
</style>
