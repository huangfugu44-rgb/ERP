<template>
  <div class="data-table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" :style="{ width: column.width }">
            {{ column.label }}
          </th>
          <th v-if="$slots.actions" style="width: 200px;">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="loading-cell">
            <div class="loading-spinner">加载中...</div>
          </td>
        </tr>
        <tr v-else-if="data.length === 0">
          <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="empty-cell">
            暂无数据
          </td>
        </tr>
        <tr v-for="(row, index) in data" :key="getRowKey(row, index)" @click="handleRowClick(row)">
          <td v-for="column in columns" :key="column.key">
            <slot :name="`cell-${column.key}`" :row="row" :column="column">
              {{ getCellValue(row, column) }}
            </slot>
          </td>
          <td v-if="$slots.actions" class="actions-cell">
            <slot name="actions" :row="row"></slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({
  columns: { type: Array, required: true },
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  rowKey: { type: String, default: 'id' }
})

const emit = defineEmits(['row-click'])

const getRowKey = (row, index) => {
  return row[props.rowKey] || index
}

const getCellValue = (row, column) => {
  const value = row[column.key]
  if (column.format) {
    return formatValue(value, column.format)
  }
  return value
}

const formatValue = (value, format) => {
  if (value === null || value === undefined) return '-'

  switch (format) {
    case 'currency':
      return `¥${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
    case 'date':
      return new Date(value).toLocaleDateString('zh-CN')
    case 'datetime':
      return new Date(value).toLocaleString('zh-CN')
    case 'status':
      return value === 'active' ? '正常' : '停用'
    default:
      return value
  }
}

const handleRowClick = (row) => {
  emit('row-click', row)
}
</script>

<style scoped>
.data-table-container {
  overflow-x: auto;
  border-radius: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.data-table td {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
}

.data-table tbody tr {
  transition: background 0.2s;
  cursor: pointer;
}

.data-table tbody tr:hover {
  background: var(--bg-hover);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.actions-cell {
  text-align: right;
}

.loading-cell,
.empty-cell {
  text-align: center;
  padding: 48px 16px;
  color: var(--text-secondary);
}

.loading-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
