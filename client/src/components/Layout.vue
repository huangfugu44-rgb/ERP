<template>
  <div class="layout">
    <nav class="nav">
      <div class="nav-content">
        <router-link to="/" class="nav-logo">
          <div class="nav-logo-icon">⚡</div>
          <span>ERP</span>
        </router-link>
        
        <div class="nav-links">
          <router-link 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path"
            class="nav-link"
            :class="{ active: isActive(item.path) }"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ item.name }}</span>
          </router-link>
        </div>
        
        <div class="nav-user">
          <div class="user-info">
            <div class="user-avatar">{{ user?.username?.charAt(0).toUpperCase() || 'A' }}</div>
            <div class="user-details">
              <span class="user-name">{{ user?.username || 'Admin' }}</span>
              <span class="user-role">{{ getRoleText(user?.role) }}</span>
            </div>
          </div>
          <button @click="handleLogout" class="btn btn-secondary logout-btn">
            退出
          </button>
        </div>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

const navItems = [
  { path: '/', name: '首页', icon: '📊' },
  { path: '/purchase', name: '采购', icon: '🛒' },
  { path: '/sales', name: '销售', icon: '📤' },
  { path: '/inventory', name: '库存', icon: '📦' },
  { path: '/license-inventory', name: '许可证', icon: '🔑' },
  { path: '/subscriptions', name: '订阅', icon: '🔄' },
  { path: '/accounts-receivable', name: '应收', icon: '💵' },
  { path: '/accounts-payable', name: '应付', icon: '💳' },
  { path: '/consignment', name: '代销', icon: '🏪' },
  { path: '/cost-analysis', name: '成本核算', icon: '📈' },
  { path: '/finance', name: '财务', icon: '💰' },
  { path: '/crm', name: '客户', icon: '👥' },
  { path: '/hr', name: '人事', icon: '🏢' }
]

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const getRoleText = (role) => {
  const roleMap = {
    admin: '管理员',
    manager: '经理',
    finance: '财务',
    sales: '销售',
    purchase: '采购',
    hr: '人事'
  }
  return roleMap[role] || '用户'
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

watch(() => route.path, () => {
  document.querySelector('.main-content')?.scrollTo(0, 0)
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
  background: var(--bg-primary);
}

.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: rgba(10, 14, 26, 0.98);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  z-index: 1000;
  display: flex;
  align-items: center;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
  padding: 0 24px;
  height: 100%;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.nav-logo:hover {
  transform: scale(1.05);
}

.nav-logo-icon {
  width: 36px;
  height: 36px;
  background: var(--accent-gradient);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.nav-links {
  display: flex;
  gap: 4px;
  align-items: center;
  flex: 1;
  overflow-x: auto;
  padding: 8px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.nav-links::-webkit-scrollbar {
  display: none;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;
  flex-shrink: 0;
}

.nav-link:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.08);
}

.nav-link.active {
  color: var(--accent-primary);
  background: rgba(16, 185, 129, 0.12);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: var(--accent-gradient);
  border-radius: 1px;
}

.nav-icon {
  font-size: 16px;
}

.nav-text {
  font-size: 13px;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 38px;
  height: 38px;
  background: var(--accent-gradient);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  color: white;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.user-role {
  font-size: 11px;
  color: var(--text-secondary);
}

.logout-btn {
  padding: 8px 16px;
  font-size: 13px;
}

.main-content {
  padding-top: 86px;
  padding-bottom: 40px;
}

@media (max-width: 1400px) {
  .nav-content {
    padding: 0 16px;
  }
  
  .nav-text {
    display: none;
  }
  
  .nav-link {
    padding: 10px 12px;
  }
  
  .user-details {
    display: none;
  }
}

@media (max-width: 768px) {
  .nav {
    height: 60px;
  }
  
  .nav-content {
    padding: 0 12px;
  }
  
  .nav-logo {
    font-size: 16px;
  }
  
  .nav-logo-icon {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }
  
  .nav-links {
    gap: 2px;
  }
  
  .nav-link {
    padding: 8px 10px;
  }
  
  .nav-user {
    gap: 12px;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .logout-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .main-content {
    padding-top: 76px;
  }
}
</style>
