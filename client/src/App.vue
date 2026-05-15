<template>
  <router-view />
</template>

<script setup>
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg-primary: #f0f2f5;
  --bg-secondary: #ffffff;
  --bg-card: #ffffff;
  --bg-card-hover: #f5f7fa;
  --bg-surface: #e5e7eb;
  --accent-primary: #10b981;
  --accent-secondary: #3b82f6;
  --accent-gradient: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  --text-primary: #1f2937;
  --text-secondary: #4b5563;
  --text-muted: #9ca3af;
  --border-color: #e5e7eb;
  --shadow-glow: 0 0 40px rgba(16, 185, 129, 0.1);
  /* Element Plus 浅色主题变量覆盖 */
  --el-color-primary: #3b82f6;
  --el-color-primary-light-3: #60a5fa;
  --el-color-primary-light-5: #93c5fd;
  --el-color-primary-light-7: #bfdbfe;
  --el-color-primary-light-9: #dbeafe;
  --el-color-primary-dark-2: #2563eb;
  --el-bg-color: #ffffff;
  --el-bg-color-overlay: #ffffff;
  --el-text-color-primary: #1f2937;
  --el-text-color-regular: #4b5563;
  --el-text-color-secondary: #6b7280;
  --el-text-color-placeholder: #9ca3af;
  --el-border-color: #e5e7eb;
  --el-border-color-light: #f3f4f6;
  --el-border-color-lighter: #f9fafb;
  --el-border-color-extra-light: #f9fafb;
  --el-fill-color: #f3f4f6;
  --el-fill-color-light: #f9fafb;
  --el-fill-color-lighter: #f9fafb;
  --el-fill-color-blank: #ffffff;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 15px;
}

#app {
  width: 100%;
  min-height: 100vh;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-surface);
}

::-webkit-scrollbar-thumb {
  background: #c1c5cc;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent-primary);
}

/* 选中文字样式 */
::selection {
  background: rgba(16, 185, 129, 0.2);
  color: var(--text-primary);
}

/* Element Plus 组件样式增强 */
:deep(.el-card) {
  background-color: var(--bg-card);
  border-color: var(--border-color);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-card__header) {
  border-bottom-color: var(--border-color);
  color: var(--text-primary);
}

:deep(.el-table) {
  background-color: transparent;
  color: var(--text-primary);
}

:deep(.el-table th.el-table__cell) {
  background-color: var(--bg-surface);
  color: var(--text-primary);
}

:deep(.el-table tr) {
  background-color: transparent;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: rgba(16, 185, 129, 0.08);
}

:deep(.el-table td.el-table__cell) {
  border-bottom-color: var(--border-color);
  color: var(--text-secondary);
}

:deep(.el-button) {
  color: var(--text-primary);
}

:deep(.el-button--primary) {
  color: white;
}

:deep(.el-input__wrapper) {
  background-color: var(--bg-secondary);
  box-shadow: 0 0 0 1px var(--border-color) inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}

:deep(.el-input__inner) {
  color: var(--text-primary);
}

:deep(.el-input__inner::placeholder) {
  color: var(--text-muted);
}

:deep(.el-select__wrapper) {
  background-color: var(--bg-secondary);
  box-shadow: 0 0 0 1px var(--border-color) inset;
}

:deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}

:deep(.el-select__placeholder) {
  color: var(--text-muted);
}

:deep(.el-select__selected-item) {
  color: var(--text-primary);
}

:deep(.el-dialog) {
  background-color: var(--bg-card);
  box-shadow: 0 20px 60px -20px rgba(0, 0, 0, 0.25);
}

:deep(.el-dialog__header) {
  border-bottom-color: var(--border-color);
  color: var(--text-primary);
}

:deep(.el-dialog__title) {
  color: var(--text-primary);
}

:deep(.el-form-item__label) {
  color: var(--text-secondary);
}

:deep(.el-tag) {
  color: var(--text-primary);
}

:deep(.el-pagination) {
  color: var(--text-secondary);
}

:deep(.el-pager li) {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
}

:deep(.el-pager li.is-active) {
  background-color: var(--el-color-primary);
  color: white;
}

:deep(.el-breadcrumb__inner) {
  color: var(--text-secondary);
}

:deep(.el-breadcrumb__inner.is-link) {
  color: var(--text-primary);
}

:deep(.el-dropdown-menu) {
  background-color: var(--bg-card);
  border-color: var(--border-color);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

:deep(.el-dropdown-menu__item) {
  color: var(--text-secondary);
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: var(--bg-card-hover);
  color: var(--text-primary);
}

:deep(.el-tabs__item) {
  color: var(--text-muted);
}

:deep(.el-tabs__item.is-active) {
  color: var(--el-color-primary);
}

:deep(.el-tabs__nav-wrap::after) {
  background-color: var(--border-color);
}

:deep(.el-tabs__active-bar) {
  background-color: var(--el-color-primary);
}

:deep(.el-message-box) {
  background-color: var(--bg-card);
  box-shadow: 0 20px 60px -20px rgba(0, 0, 0, 0.25);
}

:deep(.el-message-box__title) {
  color: var(--text-primary);
}

:deep(.el-message-box__content) {
  color: var(--text-secondary);
}
</style>
