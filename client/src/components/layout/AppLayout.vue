<template>
  <div class="app-layout">
    <AppSidebar class="layout-sidebar" />
    <div class="layout-main">
      <AppHeader class="layout-header" />
      <main class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      <footer class="layout-footer">
        <p>© 2024 AIERP管理系统 - 软件代理行业解决方案</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
</script>

<style scoped>
.app-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.layout-sidebar {
  flex-shrink: 0;
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f0f2f5;
}

.layout-header {
  flex-shrink: 0;
}

.layout-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
}

.layout-footer {
  flex-shrink: 0;
  padding: 12px 20px;
  text-align: center;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  color: #909399;
  font-size: 12px;
}

.layout-footer p {
  margin: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
