<template>
  <aside class="app-sidebar" :class="{ 'is-collapsed': isCollapsed }">
    <el-scrollbar class="sidebar-scrollbar">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :unique-opened="true"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        :router="true"
      >
        <el-menu-item index="/dashboard">
          <HomeFilled />
          <template #title>仪表盘</template>
        </el-menu-item>

        <el-sub-menu index="retail">
          <template #title>
            <Shop />
            <span>零售管理</span>
          </template>
          <el-menu-item index="/retail">零售主页</el-menu-item>
          <el-menu-item index="/retail/order">零售单</el-menu-item>
          <el-menu-item index="/retail/return">零售退货单</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="purchase">
          <template #title>
            <ShoppingCart />
            <span>采购管理</span>
          </template>
          <el-menu-item index="/purchase">采购主页</el-menu-item>
          <el-menu-item index="/purchase/order">采购订单</el-menu-item>
          <el-menu-item index="/purchase/inbound">采购入库</el-menu-item>
          <el-menu-item index="/purchase/return">采购退货</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="sales">
          <template #title>
            <Sell />
            <span>销售管理</span>
          </template>
          <el-menu-item index="/sales">销售主页</el-menu-item>
          <el-menu-item index="/sales/order">销售订单</el-menu-item>
          <el-menu-item index="/sales/outbound">销售出库</el-menu-item>
          <el-menu-item index="/sales/return">销售退货</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="warehouse">
          <template #title>
            <Box />
            <span>仓库管理</span>
          </template>
          <el-menu-item index="/warehouse">仓库主页</el-menu-item>
          <el-menu-item index="/warehouse/inventory">库存查询</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="finance">
          <template #title>
            <Money />
            <span>财务管理</span>
          </template>
          <el-menu-item index="/finance">财务主页</el-menu-item>
          <el-menu-item index="/finance/receipt">收款单</el-menu-item>
          <el-menu-item index="/finance/payment">付款单</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="report">
          <template #title>
            <DataAnalysis />
            <span>报表查询</span>
          </template>
          <el-menu-item index="/report">报表中心</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="product">
          <template #title>
            <Goods />
            <span>商品管理</span>
          </template>
          <el-menu-item index="/product">商品列表</el-menu-item>
          <el-menu-item index="/product/category">商品分类</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="baseData">
          <template #title>
            <Document />
            <span>基本资料</span>
          </template>
          <el-menu-item index="/baseData">资料主页</el-menu-item>
          <el-menu-item index="/baseData/supplier">供应商管理</el-menu-item>
          <el-menu-item index="/baseData/customer">客户管理</el-menu-item>
          <el-menu-item index="/baseData/warehouse">仓库管理</el-menu-item>
          <el-menu-item index="/baseData/account">账户管理</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="system">
          <template #title>
            <Setting />
            <span>系统管理</span>
          </template>
          <el-menu-item index="/system">系统主页</el-menu-item>
          <el-menu-item index="/system/user">用户管理</el-menu-item>
          <el-menu-item index="/system/role">角色管理</el-menu-item>
          <el-menu-item index="/system/log">操作日志</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const appStore = useAppStore()

const isCollapsed = computed(() => appStore.sidebarCollapsed)

const activeMenu = computed(() => {
  const { path } = route
  return path
})
</script>

<style scoped>
.app-sidebar {
  width: 200px;
  height: 100%;
  background-color: #304156;
  transition: width 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.app-sidebar.is-collapsed {
  width: 64px;
}

.app-sidebar.is-collapsed :deep(.el-menu-item span),
.app-sidebar.is-collapsed :deep(.el-sub-menu__title span) {
  display: none;
}

.sidebar-scrollbar {
  flex: 1;
  height: 100%;
}

:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

:deep(.el-menu) {
  border: none;
  width: 100%;
  transition: width 0.3s ease;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: #263445 !important;
}

:deep(.el-menu-item.is-active) {
  background-color: #409EFF !important;
  color: #fff !important;
}

:deep(.el-sub-menu .el-menu-item) {
  min-width: 0;
  padding-left: 50px !important;
}

:deep(.el-sub-menu .el-menu-item.is-active) {
  background-color: #263445 !important;
  border-right: 3px solid #409EFF;
}

/* 给所有图标添加默认样式 */
:deep(.el-menu-item svg),
:deep(.el-sub-menu__title svg) {
  margin-right: 10px;
  width: 18px;
  height: 18px;
  vertical-align: middle;
}
</style>
