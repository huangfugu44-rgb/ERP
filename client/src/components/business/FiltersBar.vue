<template>
  <div class="filters-bar">
    <div class="filters-left">
      <slot></slot>
    </div>
    <div class="filters-right">
      <div v-if="searchable" class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          :placeholder="searchPlaceholder"
          @input="handleSearch"
        />
      </div>
      <button v-if="addButton" class="btn btn-primary" @click="$emit('add')">
        {{ addButtonText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  searchable: { type: Boolean, default: true },
  searchPlaceholder: { type: String, default: '搜索...' },
  addButton: { type: Boolean, default: true },
  addButtonText: { type: String, default: '➕ 添加' },
  debounce: { type: Number, default: 300 }
})

const emit = defineEmits(['search', 'add'])

const searchQuery = ref('')
let debounceTimer = null

const handleSearch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('search', searchQuery.value)
  }, props.debounce)
}

watch(() => props.searchQuery, (newVal) => {
  searchQuery.value = newVal
})
</script>

<style scoped>
.filters-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filters-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.filters-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-box {
  position: relative;
}

.search-input {
  padding: 10px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  min-width: 280px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.search-input::placeholder {
  color: var(--text-secondary);
}
</style>
