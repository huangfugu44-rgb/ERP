<template>
  <div class="base-data-page">
    <el-row :gutter="20" class="main-content">
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
import { OfficeBuilding, User, Box, Wallet } from '@element-plus/icons-vue'

const router = useRouter()
const menuItems = [
  { path: '/baseData/supplier', title: '供应商管理', description: '管理供应商信息', icon: OfficeBuilding, bgColor: 'rgba(64, 158, 255, 0.1)', color: '#409EFF' },
  { path: '/baseData/customer', title: '客户管理', description: '管理客户信息', icon: User, bgColor: 'rgba(103, 194, 58, 0.1)', color: '#67C23A' },
  { path: '/baseData/warehouse', title: '仓库管理', description: '管理仓库信息', icon: Box, bgColor: 'rgba(230, 162, 60, 0.1)', color: '#E6A23C' },
  { path: '/baseData/account', title: '账户管理', description: '管理资金账户', icon: Wallet, bgColor: 'rgba(245, 108, 108, 0.1)', color: '#F56C6C' }
]

const goToPage = (path) => router.push(path)
</script>

<style scoped>
.base-data-page { padding: 0; }
.main-content { margin-bottom: 20px; }
.menu-card { border-radius: 12px; cursor: pointer; transition: all 0.3s; margin-bottom: 20px; }
.menu-card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); }
.menu-content { display: flex; align-items: center; gap: 20px; }
.menu-icon { width: 64px; height: 64px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.menu-info h3 { margin: 0 0 8px 0; font-size: 18px; color: #303133; }
.menu-info p { margin: 0; font-size: 14px; color: #909399; }
</style>
