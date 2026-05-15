import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘', requiresAuth: true }
      },
      {
        path: '/retail',
        name: 'Retail',
        component: () => import('@/views/Retail.vue'),
        meta: { title: '零售管理', requiresAuth: true }
      },
      {
        path: '/retail/order',
        name: 'RetailOrder',
        component: () => import('@/views/RetailOrder.vue'),
        meta: { title: '零售单', requiresAuth: true }
      },
      {
        path: '/retail/return',
        name: 'RetailReturn',
        component: () => import('@/views/RetailReturn.vue'),
        meta: { title: '零售退货单', requiresAuth: true }
      },
      {
        path: '/purchase',
        name: 'Purchase',
        component: () => import('@/views/Purchase.vue'),
        meta: { title: '采购管理', requiresAuth: true }
      },
      {
        path: '/purchase/order',
        name: 'PurchaseOrder',
        component: () => import('@/views/PurchaseOrder.vue'),
        meta: { title: '采购订单', requiresAuth: true }
      },
      {
        path: '/purchase/inbound',
        name: 'PurchaseInbound',
        component: () => import('@/views/PurchaseInbound.vue'),
        meta: { title: '采购入库', requiresAuth: true }
      },
      {
        path: '/purchase/return',
        name: 'PurchaseReturn',
        component: () => import('@/views/PurchaseReturn.vue'),
        meta: { title: '采购退货', requiresAuth: true }
      },
      {
        path: '/sales',
        name: 'Sales',
        component: () => import('@/views/Sales.vue'),
        meta: { title: '销售管理', requiresAuth: true }
      },
      {
        path: '/sales/order',
        name: 'SalesOrder',
        component: () => import('@/views/SalesOrder.vue'),
        meta: { title: '销售订单', requiresAuth: true }
      },
      {
        path: '/sales/outbound',
        name: 'SalesOutbound',
        component: () => import('@/views/SalesOutbound.vue'),
        meta: { title: '销售出库', requiresAuth: true }
      },
      {
        path: '/sales/return',
        name: 'SalesReturn',
        component: () => import('@/views/SalesReturn.vue'),
        meta: { title: '销售退货', requiresAuth: true }
      },
      {
        path: '/warehouse',
        name: 'Warehouse',
        component: () => import('@/views/Warehouse.vue'),
        meta: { title: '仓库管理', requiresAuth: true }
      },
      {
        path: '/warehouse/inventory',
        name: 'WarehouseInventory',
        component: () => import('@/views/WarehouseInventory.vue'),
        meta: { title: '库存查询', requiresAuth: true }
      },
      {
        path: '/finance',
        name: 'Finance',
        component: () => import('@/views/Finance.vue'),
        meta: { title: '财务管理', requiresAuth: true }
      },
      {
        path: '/finance/receipt',
        name: 'FinanceReceipt',
        component: () => import('@/views/FinanceReceipt.vue'),
        meta: { title: '收款单', requiresAuth: true }
      },
      {
        path: '/finance/payment',
        name: 'FinancePayment',
        component: () => import('@/views/FinancePayment.vue'),
        meta: { title: '付款单', requiresAuth: true }
      },
      {
        path: '/report',
        name: 'Report',
        component: () => import('@/views/Report.vue'),
        meta: { title: '报表中心', requiresAuth: true }
      },
      {
        path: '/product',
        name: 'Product',
        component: () => import('@/views/Product.vue'),
        meta: { title: '商品管理', requiresAuth: true }
      },
      {
        path: '/product/category',
        name: 'ProductCategory',
        component: () => import('@/views/ProductCategory.vue'),
        meta: { title: '商品分类', requiresAuth: true }
      },
      {
        path: '/baseData',
        name: 'BaseData',
        component: () => import('@/views/BaseData.vue'),
        meta: { title: '基本资料', requiresAuth: true }
      },
      {
        path: '/baseData/supplier',
        name: 'BaseDataSupplier',
        component: () => import('@/views/BaseDataSupplier.vue'),
        meta: { title: '供应商管理', requiresAuth: true }
      },
      {
        path: '/baseData/customer',
        name: 'BaseDataCustomer',
        component: () => import('@/views/BaseDataCustomer.vue'),
        meta: { title: '客户管理', requiresAuth: true }
      },
      {
        path: '/baseData/warehouse',
        name: 'BaseDataWarehouse',
        component: () => import('@/views/BaseDataWarehouse.vue'),
        meta: { title: '仓库管理', requiresAuth: true }
      },
      {
        path: '/baseData/account',
        name: 'BaseDataAccount',
        component: () => import('@/views/BaseDataAccount.vue'),
        meta: { title: '账户管理', requiresAuth: true }
      },
      {
        path: '/system',
        name: 'System',
        component: () => import('@/views/System.vue'),
        meta: { title: '系统管理', requiresAuth: true }
      },
      {
        path: '/system/user',
        name: 'SystemUser',
        component: () => import('@/views/SystemUser.vue'),
        meta: { title: '用户管理', requiresAuth: true }
      },
      {
        path: '/system/role',
        name: 'SystemRole',
        component: () => import('@/views/SystemRole.vue'),
        meta: { title: '角色管理', requiresAuth: true }
      },
      {
        path: '/system/log',
        name: 'SystemLog',
        component: () => import('@/views/SystemLog.vue'),
        meta: { title: '操作日志', requiresAuth: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - AIERP管理系统`
  }

  if (to.meta.requiresAuth) {
    const token = getToken()
    if (!token) {
      ElMessage.warning('请先登录')
      next({ path: '/login' })
    } else {
      next()
    }
  } else {
    if (to.path === '/login' && getToken()) {
      next({ path: '/' })
    } else {
      next()
    }
  }
})

export default router
