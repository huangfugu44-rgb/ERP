<template>
  <div class="retail-order-page">
    <el-row :gutter="20">
      <el-col :span="14">
        <el-card class="product-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">商品列表</span>
              <el-input
                v-model="searchProduct"
                placeholder="搜索商品名称/编码"
                style="width: 250px"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </template>
          <div class="category-tabs">
            <el-radio-group v-model="selectedCategory" size="small">
              <el-radio-button value="all">全部</el-radio-button>
              <el-radio-button value="software">软件产品</el-radio-button>
              <el-radio-button value="service">服务类</el-radio-button>
              <el-radio-button value="hardware">硬件设备</el-radio-button>
            </el-radio-group>
          </div>
          <div class="product-grid">
            <div v-for="product in filteredProducts" :key="product.id" class="product-item" @click="addToCart(product)">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-code">{{ product.code }}</div>
              <div class="product-price">¥{{ product.price }}</div>
              <div class="product-stock">库存: {{ product.stock }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="10">
        <el-card class="cart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">当前零售单</span>
              <el-button link @click="clearCart">清空</el-button>
            </div>
          </template>
          
          <div class="cart-info">
            <div class="info-item">
              <span class="label">单据编号:</span>
              <span class="value">{{ orderNo }}</span>
            </div>
            <div class="info-item">
              <span class="label">客户:</span>
              <el-input v-model="customerName" placeholder="请输入客户名称" size="small" style="width: 150px" />
            </div>
            <div class="info-item">
              <span class="label">销售人员:</span>
              <el-select v-model="salesperson" placeholder="选择销售人员" size="small" style="width: 150px">
                <el-option label="张三" value="张三" />
                <el-option label="李四" value="李四" />
                <el-option label="王五" value="王五" />
              </el-select>
            </div>
          </div>
          
          <el-table :data="cartItems" size="small" class="cart-table">
            <el-table-column prop="name" label="商品名称" />
            <el-table-column prop="price" label="单价" width="80" align="right">
              <template #default="{ row }">¥{{ row.price }}</template>
            </el-table-column>
            <el-table-column label="数量" width="120" align="center">
              <template #default="{ row, $index }">
                <el-input-number v-model="row.quantity" :min="1" :max="99" size="small" @change="updateQuantity($index, row.quantity)" />
              </template>
            </el-table-column>
            <el-table-column label="金额" width="80" align="right">
              <template #default="{ row }">¥{{ (row.price * row.quantity).toLocaleString() }}</template>
            </el-table-column>
            <el-table-column label="操作" width="60" align="center">
              <template #default="{ row, $index }">
                <el-button type="danger" size="small" link @click="removeFromCart($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div v-if="cartItems.length === 0" class="empty-cart">
            <el-icon :size="48" color="#c0c4cc"><ShoppingCart /></el-icon>
            <p>购物车空空如也</p>
            <p>请选择商品添加到购物车</p>
          </div>
          
          <el-divider />
          
          <div class="cart-summary">
            <div class="summary-row">
              <span>商品总数:</span>
              <span>{{ totalQuantity }} 件</span>
            </div>
            <div class="summary-row">
              <span>商品金额:</span>
              <span>¥{{ subtotal.toLocaleString() }}</span>
            </div>
            <div class="summary-row">
              <span>折扣金额:</span>
              <el-input-number v-model="discountAmount" :min="0" :max="subtotal" size="small" style="width: 120px" />
            </div>
            <div class="summary-row total">
              <span>应付金额:</span>
              <span class="total-amount">¥{{ actualAmount.toLocaleString() }}</span>
            </div>
          </div>
          
          <div class="payment-method">
            <span class="label">支付方式:</span>
            <el-radio-group v-model="paymentMethod">
              <el-radio value="cash">现金</el-radio>
              <el-radio value="wechat">微信</el-radio>
              <el-radio value="alipay">支付宝</el-radio>
              <el-radio value="bank">银行转账</el-radio>
            </el-radio-group>
          </div>
          
          <div class="remark-section">
            <span class="label">备注:</span>
            <el-input v-model="remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
          </div>
          
          <div class="action-buttons">
            <el-button @click="handleSave">保存单据</el-button>
            <el-button type="primary" @click="handleCheckout" :disabled="cartItems.length === 0">
              <el-icon><Money /></el-icon>
              收款结账
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="checkoutDialogVisible" title="收款结账" width="500px" destroy-on-close>
      <div class="checkout-content">
        <div class="checkout-amount">
          <span>应收金额:</span>
          <span class="amount">¥{{ actualAmount.toLocaleString() }}</span>
        </div>
        <el-form :model="checkoutForm" label-width="100px">
          <el-form-item label="实收金额">
            <el-input-number v-model="checkoutForm.receivedAmount" :min="0" :precision="2" style="width: 100%" />
          </el-form-item>
          <el-form-item label="找零">
            <span :class="{ 'change-negative': changeAmount < 0 }">
              ¥{{ changeAmount.toLocaleString() }}
            </span>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="checkoutDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCheckout">确认收款</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, ShoppingCart, Money } from '@element-plus/icons-vue'

const router = useRouter()
const searchProduct = ref('')
const selectedCategory = ref('all')
const customerName = ref('')
const salesperson = ref('')
const discountAmount = ref(0)
const paymentMethod = ref('wechat')
const remark = ref('')
const checkoutDialogVisible = ref(false)
const checkoutForm = reactive({
  receivedAmount: 0
})

const orderNo = computed(() => {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `RO${date}${random}`
})

const products = reactive([
  { id: 1, name: 'Office 365 商业版', code: 'SOFT001', price: 1999, stock: 100, category: 'software' },
  { id: 2, name: 'Adobe Creative Cloud', code: 'SOFT002', price: 2999, stock: 50, category: 'software' },
  { id: 3, name: '金山文档企业版', code: 'SOFT003', price: 899, stock: 200, category: 'software' },
  { id: 4, name: '用友U8软件', code: 'SOFT004', price: 5800, stock: 30, category: 'software' },
  { id: 5, name: '软件实施服务', code: 'SERV001', price: 500, stock: 999, category: 'service' },
  { id: 6, name: '技术支持服务(年)', code: 'SERV002', price: 1200, stock: 999, category: 'service' },
  { id: 7, name: '培训服务(天)', code: 'SERV003', price: 800, stock: 999, category: 'service' },
  { id: 8, name: '联想ThinkPad', code: 'HARD001', price: 5999, stock: 20, category: 'hardware' },
  { id: 9, name: 'Dell显示器27寸', code: 'HARD002', price: 1599, stock: 35, category: 'hardware' },
  { id: 10, name: '罗技无线键鼠套装', code: 'HARD003', price: 299, stock: 80, category: 'hardware' }
])

const cartItems = reactive([])

const filteredProducts = computed(() => {
  let result = products
  if (selectedCategory.value !== 'all') {
    result = result.filter(p => p.category === selectedCategory.value)
  }
  if (searchProduct.value) {
    const keyword = searchProduct.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(keyword) || 
      p.code.toLowerCase().includes(keyword)
    )
  }
  return result
})

const totalQuantity = computed(() => {
  return cartItems.reduce((sum, item) => sum + item.quantity, 0)
})

const subtotal = computed(() => {
  return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const actualAmount = computed(() => {
  return Math.max(0, subtotal.value - discountAmount.value)
})

const changeAmount = computed(() => {
  return checkoutForm.receivedAmount - actualAmount.value
})

const addToCart = (product) => {
  const existing = cartItems.find(item => item.id === product.id)
  if (existing) {
    existing.quantity++
  } else {
    cartItems.push({
      id: product.id,
      name: product.name,
      code: product.code,
      price: product.price,
      quantity: 1
    })
  }
}

const removeFromCart = (index) => {
  cartItems.splice(index, 1)
}

const updateQuantity = (index, quantity) => {
  if (quantity < 1) {
    removeFromCart(index)
  }
}

const clearCart = () => {
  if (cartItems.length > 0) {
    ElMessageBox.confirm('确定要清空购物车吗?', '清空确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      cartItems.splice(0, cartItems.length)
      discountAmount.value = 0
      ElMessage.success('已清空购物车')
    }).catch(() => {})
  }
}

const handleSave = () => {
  if (cartItems.length === 0) {
    ElMessage.warning('请先添加商品')
    return
  }
  ElMessage.success('零售单已保存')
}

const handleCheckout = () => {
  if (cartItems.length === 0) {
    ElMessage.warning('请先添加商品')
    return
  }
  checkoutForm.receivedAmount = actualAmount.value
  checkoutDialogVisible.value = true
}

const confirmCheckout = () => {
  if (changeAmount.value < 0) {
    ElMessage.error('实收金额不足')
    return
  }
  
  ElMessageBox.alert(
    `收款成功！找零 ¥${changeAmount.toLocaleString()}`,
    '结账完成',
    {
      confirmButtonText: '确定',
      type: 'success',
      callback: () => {
        cartItems.splice(0, cartItems.length)
        discountAmount.value = 0
        customerName.value = ''
        remark.value = ''
        checkoutDialogVisible.value = false
        router.push('/retail')
      }
    }
  )
}
</script>

<style scoped>
.retail-order-page {
  padding: 0;
}

.product-card, .cart-card {
  border-radius: 8px;
  height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-color: #e5e7eb;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.category-tabs {
  margin-bottom: 15px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  flex: 1;
  overflow-y: auto;
}

.product-item {
  padding: 12px;
  background: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.product-item:hover {
  background: #f5f7fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #409EFF;
}

.product-name {
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-code {
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 6px;
}

.product-price {
  font-size: 16px;
  font-weight: 600;
  color: #ef4444;
}

.product-stock {
  font-size: 11px;
  color: #10b981;
  margin-top: 4px;
}

.cart-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.cart-info {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-item .label {
  font-size: 13px;
  color: #4b5563;
}

.cart-table {
  flex: 1;
  overflow-y: auto;
}

.empty-cart {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.empty-cart p {
  margin: 10px 0 0 0;
}

.cart-summary {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid #e5e7eb;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  color: #4b5563;
}

.summary-row.total {
  border-top: 1px dashed #e5e7eb;
  padding-top: 12px;
  margin-top: 8px;
  font-weight: 600;
}

.total-amount {
  font-size: 24px;
  font-weight: 700;
  color: #ef4444;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.payment-method .label {
  font-size: 14px;
  color: #4b5563;
}

.remark-section {
  margin-bottom: 15px;
}

.remark-section .label {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 8px;
  display: block;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.action-buttons .el-button--primary {
  background: linear-gradient(135deg, #409EFF, #66b1ff);
  border: none;
}

.checkout-content {
  padding: 20px;
}

.checkout-amount {
  text-align: center;
  margin-bottom: 30px;
  font-size: 16px;
  color: #4b5563;
}

.checkout-amount .amount {
  display: block;
  font-size: 36px;
  font-weight: 700;
  color: #ef4444;
  margin-top: 10px;
}

.change-negative {
  color: #ef4444;
  font-weight: 600;
}
</style>
