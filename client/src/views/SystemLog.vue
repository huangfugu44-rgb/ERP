<template>
  <div class="system-log-page">
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">操作日志</span>
        </div>
      </template>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="操作人"><el-input v-model="searchForm.operator" placeholder="请输入操作人" clearable /></el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.actionType" placeholder="选择类型" clearable style="width: 120px">
            <el-option label="登录" value="login" />
            <el-option label="新增" value="create" />
            <el-option label="编辑" value="update" />
            <el-option label="删除" value="delete" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>查询</el-button><el-button @click="handleReset">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card class="table-card">
      <el-table :data="logList" stripe style="width: 100%">
        <el-table-column prop="operateTime" label="操作时间" width="180" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="actionType" label="操作类型" width="100" align="center"><template #default="{ row }"><el-tag :type="getActionType(row.actionType)" size="small">{{ getActionText(row.actionType) }}</el-tag></template></el-table-column>
        <el-table-column prop="module" label="模块" width="120" />
        <el-table-column prop="content" label="操作内容" />
        <el-table-column prop="ipAddress" label="IP地址" width="140" />
        <el-table-column prop="result" label="结果" width="80" align="center"><template #default="{ row }"><el-tag :type="row.result === '成功' ? 'success' : 'danger'" size="small">{{ row.result }}</el-tag></template></el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" /></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const searchForm = reactive({ operator: '', actionType: '', dateRange: [] })
const currentPage = ref(1), pageSize = ref(10), total = ref(8)
const logList = reactive([
  { id: 1, operateTime: '2024-05-15 10:30:25', operator: 'admin', actionType: 'login', module: '系统', content: '用户登录系统', ipAddress: '192.168.1.100', result: '成功' },
  { id: 2, operateTime: '2024-05-15 10:35:12', operator: 'admin', actionType: 'create', module: '销售管理', content: '新建销售订单 SO20240515001', ipAddress: '192.168.1.100', result: '成功' },
  { id: 3, operateTime: '2024-05-15 10:40:08', operator: 'admin', actionType: 'update', module: '销售管理', content: '编辑销售订单 SO20240514002', ipAddress: '192.168.1.100', result: '成功' },
  { id: 4, operateTime: '2024-05-15 10:45:33', operator: 'zhangsan', actionType: 'login', module: '系统', content: '用户登录系统', ipAddress: '192.168.1.101', result: '成功' },
  { id: 5, operateTime: '2024-05-15 10:50:15', operator: 'lisi', actionType: 'create', module: '采购管理', content: '新建采购订单 PO20240515001', ipAddress: '192.168.1.102', result: '成功' },
  { id: 6, operateTime: '2024-05-15 10:55:42', operator: 'admin', actionType: 'delete', module: '商品管理', content: '删除商品测试商品', ipAddress: '192.168.1.100', result: '成功' },
  { id: 7, operateTime: '2024-05-14 18:00:05', operator: 'admin', actionType: 'login', module: '系统', content: '用户退出系统', ipAddress: '192.168.1.100', result: '成功' },
  { id: 8, operateTime: '2024-05-14 17:30:22', operator: 'admin', actionType: 'create', module: '用户管理', content: '新建用户 zhaoliu', ipAddress: '192.168.1.100', result: '成功' }
])

const getActionType = (type) => ({ login: 'info', create: 'success', update: 'warning', delete: 'danger' }[type] || '')
const getActionText = (type) => ({ login: '登录', create: '新增', update: '编辑', delete: '删除' }[type] || type)
const handleSearch = () => ElMessage.success('查询成功')
const handleReset = () => { searchForm.operator = ''; searchForm.actionType = ''; searchForm.dateRange = [] }
</script>

<style scoped>
.system-log-page { padding: 0; }
.search-card, .table-card { border-radius: 8px; margin-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 16px; font-weight: 600; color: #303133; }
.pagination-container { display: flex; justify-content: flex-end; margin-top: 20px; }
</style>
