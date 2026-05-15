<template>
  <div class="system-page">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="8" v-for="item in menuItems" :key="item.path">
        <el-card class="menu-card" shadow="hover" @click="goToPage(item.path)">
          <div class="menu-content">
            <div class="menu-icon" :style="{ background: item.bgColor }">
              <el-icon :size="32" :color="item.color"><component :is="item.icon" /></el-icon>
            </div>
            <div class="menu-info">
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { User, Key, Document, Setting } from '@element-plus/icons-vue'

const router = useRouter()
const menuItems = [
  { path: '/system/user', title: '用户管理', description: '管理系统用户', icon: User, bgColor: 'rgba(64, 158, 255, 0.1)', color: '#409EFF' },
  { path: '/system/role', title: '角色管理', description: '管理系统角色', icon: Key, bgColor: 'rgba(103, 194, 58, 0.1)', color: '#67C23A' },
  { path: '/system/log', title: '操作日志', description: '查看操作日志', icon: Document, bgColor: 'rgba(230, 162, 60, 0.1)', color: '#E6A23C' },
  { path: '/system/settings', title: '系统设置', description: '系统参数设置', icon: Setting, bgColor: 'rgba(245, 108, 108, 0.1)', color: '#F56C6C' }
]

const goToPage = (path) => router.push(path)
</script>

<style scoped>
.system-page { padding: 0; }
.menu-card { border-radius: 12px; cursor: pointer; transition: all 0.3s; margin-bottom: 20px; }
.menu-card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); }
.menu-content { display: flex; align-items: center; gap: 20px; }
.menu-icon { width: 64px; height: 64px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.menu-info h3 { margin: 0 0 8px 0; font-size: 18px; color: #303133; }
.menu-info p { margin: 0; font-size: 14px; color: #909399; }
</style>
