<template>
  <header class="app-header">
    <div class="header-left">
      <div class="logo-area">
        <div class="toggle-icon" @click="handleToggleSidebar">
          <Fold v-if="!sidebarCollapsed" />
          <Expand v-else />
        </div>
        <h1 class="system-title">ERP管理系统</h1>
      </div>
    </div>
    
    <div class="header-center">
      <div class="search-box">
        <Search />
        <input type="text" placeholder="搜索功能菜单..." v-model="searchQuery" @keyup.enter="handleSearch" />
      </div>
    </div>
    
    <div class="header-right">
      <div class="header-actions">
        <el-tooltip content="全屏" placement="bottom">
          <div class="action-icon" @click="toggleFullScreen">
            <FullScreen />
          </div>
        </el-tooltip>
        
        <el-tooltip content="锁屏" placement="bottom">
          <div class="action-icon" @click="handleLockScreen">
            <Lock />
          </div>
        </el-tooltip>
        
        <el-tooltip content="消息" placement="bottom">
          <el-badge :value="3" :hidden="true" class="message-badge">
            <div class="action-icon" @click="showMessageCenter">
              <Bell />
            </div>
          </el-badge>
        </el-tooltip>
      </div>
      
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="32">
            <UserFilled />
          </el-avatar>
          <span class="username">{{ username }}</span>
          <div class="arrow">
            <ArrowDown />
          </div>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <User />
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <Setting />
              系统设置
            </el-dropdown-item>
            <el-dropdown-item command="password">
              <Key />
              修改密码
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <SwitchButton />
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

const searchQuery = ref('')
const sidebarCollapsed = ref(false)

const username = authStore.username || authStore.userInfo?.username || '管理员'

const handleToggleSidebar = () => {
  appStore.toggleSidebar()
  sidebarCollapsed.value = appStore.sidebarCollapsed
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    ElMessage.info(`搜索功能开发中: ${searchQuery.value}`)
  }
}

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

const handleLockScreen = () => {
  ElMessageBox.confirm('确定要锁屏吗?', '锁屏', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('锁屏功能开发中')
  }).catch(() => {})
}

const showMessageCenter = () => {
  ElMessage.info('消息中心开发中')
}

const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人中心开发中')
      break
    case 'settings':
      ElMessage.info('系统设置开发中')
      break
    case 'password':
      ElMessage.info('修改密码开发中')
      break
    case 'logout':
      try {
        await authStore.logout()
        ElMessage.success('已安全退出系统')
        router.push('/login')
      } catch (error) {
        ElMessage.error('退出失败')
      }
      break
  }
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  color: #fff;
  position: relative;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-area {
  display: flex;
  align-items: center;
}

.toggle-icon {
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background 0.3s;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-icon:hover {
  background: rgba(255, 255, 255, 0.2);
}

.toggle-icon svg {
  width: 24px;
  height: 24px;
}

.system-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
  white-space: nowrap;
}

.header-center {
  flex: 1;
  max-width: 400px;
  margin: 0 40px;
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 8px 16px;
  transition: all 0.3s;
}

.search-box:hover,
.search-box:focus-within {
  background: rgba(255, 255, 255, 0.25);
}

.search-box svg {
  width: 18px;
  height: 18px;
}

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 14px;
  margin-left: 8px;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-icon {
  font-size: 20px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.action-icon svg {
  width: 20px;
  height: 20px;
}

.message-badge {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.2);
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
}

.arrow svg {
  width: 12px;
  height: 12px;
}

.user-info:hover .arrow {
  transform: rotate(180deg);
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-dropdown-menu__item svg) {
  width: 16px;
  height: 16px;
}
</style>
