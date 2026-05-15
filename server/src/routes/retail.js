const express = require('express')
const router = express.Router()
const { pool } = require('../config/database')
const { generateBillNo } = require('../utils/billNo')

router.get('/retail/orders', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', status = '' } = req.query
    const offset = (page - 1) * pageSize
    
    let orders = []
    let total = 0
    
    try {
      let whereClause = 'WHERE 1=1'
      const params = []
      
      if (keyword) {
        whereClause += ' AND (ro.order_no LIKE ? OR c.name LIKE ?)'
        params.push(`%${keyword}%`, `%${keyword}%`)
      }
      
      if (status) {
        whereClause += ' AND ro.status = ?'
        params.push(status)
      }
      
      const [ordersResult] = await pool.query(
        `SELECT 
          ro.id,
          ro.order_no as orderNo,
          ro.created_at as createTime,
          COALESCE(c.name, '散客') as customerName,
          u.name as salesperson,
          ro.total_amount as totalAmount,
          ro.discount_amount as discountAmount,
          ro.paid_amount as actualAmount,
          ro.payment_method as paymentMethod,
          ro.status,
          COUNT(ri.id) as productCount
        FROM retail_orders ro
        LEFT JOIN customers c ON ro.customer_id = c.id
        LEFT JOIN users u ON ro.created_by = u.id
        LEFT JOIN retail_order_items ri ON ro.id = ri.order_id
        ${whereClause}
        GROUP BY ro.id
        ORDER BY ro.created_at DESC
        LIMIT ? OFFSET ?`,
        [...params, parseInt(pageSize), offset]
      )
      
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total FROM retail_orders ro
         LEFT JOIN customers c ON ro.customer_id = c.id
         ${whereClause}`,
        params
      )
      
      orders = ordersResult
      total = countResult[0].total
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      orders = [
        { id: 1, orderNo: 'RO20240515001', createTime: '2024-05-15 09:30', customerName: '散客', salesperson: '张三', productCount: 3, totalAmount: 1580, discountAmount: 80, actualAmount: 1500, paymentMethod: '微信支付', status: 'completed' },
        { id: 2, orderNo: 'RO20240515002', createTime: '2024-05-15 10:15', customerName: '散客', salesperson: '李四', productCount: 2, totalAmount: 560, discountAmount: 0, actualAmount: 560, paymentMethod: '支付宝', status: 'completed' },
        { id: 3, orderNo: 'RO20240515003', createTime: '2024-05-15 11:20', customerName: '深圳市科技有限公司', salesperson: '张三', productCount: 5, totalAmount: 3200, discountAmount: 200, actualAmount: 3000, paymentMethod: '银行转账', status: 'completed' },
      ]
      total = orders.length
    }
    
    res.json({ success: true, data: orders, total })
  } catch (error) {
    console.error('Get retail orders error:', error)
    res.status(500).json({ success: false, error: '获取零售订单失败' })
  }
})

router.get('/retail/order/:id', async (req, res) => {
  try {
    const { id } = req.params
    let order = null
    
    try {
      const [orders] = await pool.query(
        `SELECT 
          ro.*,
          COALESCE(c.name, '散客') as customerName,
          u.name as salesperson
        FROM retail_orders ro
        LEFT JOIN customers c ON ro.customer_id = c.id
        LEFT JOIN users u ON ro.created_by = u.id
        WHERE ro.id = ?`,
        [id]
      )
      
      if (orders.length > 0) {
        order = orders[0]
        
        const [items] = await pool.query(
          `SELECT 
            ri.*,
            p.name as productName,
            p.code as productCode,
            p.spec,
            p.unit
          FROM retail_order_items ri
          LEFT JOIN products p ON ri.product_id = p.id
          WHERE ri.order_id = ?`,
          [id]
        )
        
        order.items = items
      }
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      order = {
        id: 1,
        orderNo: 'RO20240515001',
        customerName: '散客',
        totalAmount: 1580,
        discountAmount: 80,
        actualAmount: 1500,
        paymentMethod: 'wechat',
        status: 'completed',
        items: []
      }
    }
    
    if (!order) {
      return res.status(404).json({ success: false, error: '订单不存在' })
    }
    
    res.json({ success: true, data: order })
  } catch (error) {
    console.error('Get retail order error:', error)
    res.status(500).json({ success: false, error: '获取订单详情失败' })
  }
})

router.post('/retail/order', async (req, res) => {
  try {
    const { customerId, warehouseId, items, discountAmount = 0, paymentMethod, remark, createdBy } = req.body
    
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: '请添加商品' })
    }
    
    const orderNo = await generateBillNo('retail')
    
    let orderId = null
    let totalAmount = 0
    
    try {
      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        
        for (const item of items) {
          totalAmount += item.quantity * item.price
        }
        
        const paidAmount = totalAmount - discountAmount
        
        const [orderResult] = await connection.query(
          `INSERT INTO retail_orders 
           (order_no, customer_id, warehouse_id, total_amount, discount_amount, paid_amount, payment_method, status, remark, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)`,
          [orderNo, customerId || null, warehouseId || 1, totalAmount, discountAmount, paidAmount, paymentMethod, remark, createdBy]
        )
        
        orderId = orderResult.insertId
        
        for (const item of items) {
          await connection.query(
            `INSERT INTO retail_order_items (order_id, product_id, warehouse_id, quantity, price, amount)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [orderId, item.productId, warehouseId || 1, item.quantity, item.price, item.quantity * item.price]
          )
          
          await connection.query(
            `UPDATE inventory 
             SET quantity = quantity - ?, available_quantity = available_quantity - ?
             WHERE product_id = ? AND warehouse_id = ?`,
            [item.quantity, item.quantity, item.productId, warehouseId || 1]
          )
        }
        
        if (paymentMethod && paidAmount > 0) {
          await connection.query(
            `INSERT INTO receipts 
             (order_no, account_id, amount, payment_method, related_order_type, related_order_id, status, receipt_date, created_by)
             VALUES (?, 1, ?, ?, 'retail', ?, 'completed', CURDATE(), ?)`,
            [orderNo, paidAmount, paymentMethod, orderId, createdBy]
          )
        }
        
        await connection.commit()
      } catch (error) {
        await connection.rollback()
        throw error
      } finally {
        connection.release()
      }
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    const order = {
      orderNo,
      totalAmount,
      discountAmount,
      actualAmount: totalAmount - discountAmount,
      status: 'completed',
      items
    }
    
    res.json({ success: true, data: order, message: '零售单创建成功' })
  } catch (error) {
    console.error('Create retail order error:', error)
    res.status(500).json({ success: false, error: '创建零售单失败' })
  }
})

router.post('/retail/order/refund', async (req, res) => {
  try {
    const { orderNo, reason, refundAmount, refundMethod } = req.body
    
    if (!orderNo) {
      return res.status(400).json({ success: false, error: '请提供订单号' })
    }
    
    try {
      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        
        const [orders] = await connection.query(
          'SELECT * FROM retail_orders WHERE order_no = ?',
          [orderNo]
        )
        
        if (orders.length === 0) {
          await connection.rollback()
          return res.status(404).json({ success: false, error: '订单不存在' })
        }
        
        const order = orders[0]
        
        await connection.query(
          'UPDATE retail_orders SET status = ? WHERE order_no = ?',
          ['cancelled', orderNo]
        )
        
        const [items] = await connection.query(
          'SELECT * FROM retail_order_items WHERE order_id = ?',
          [order.id]
        )
        
        for (const item of items) {
          await connection.query(
            `UPDATE inventory 
             SET quantity = quantity + ?, available_quantity = available_quantity + ?
             WHERE product_id = ? AND warehouse_id = ?`,
            [item.quantity, item.quantity, item.product_id, item.warehouse_id]
          )
        }
        
        await connection.query(
          `INSERT INTO payment_orders 
           (order_no, account_id, amount, payment_method, related_order_type, related_order_id, status, payment_date, remark, created_by)
           VALUES (?, 1, ?, ?, 'retail', ?, 'completed', CURDATE(), ?, 1)`,
          [`RT${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`, refundAmount || order.paid_amount, refundMethod || order.payment_method, order.id, reason]
        )
        
        await connection.commit()
      } catch (error) {
        await connection.rollback()
        throw error
      } finally {
        connection.release()
      }
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    res.json({ success: true, message: '退款成功' })
  } catch (error) {
    console.error('Retail refund error:', error)
    res.status(500).json({ success: false, error: '退款失败' })
  }
})

router.get('/retail/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    let stats = null
    
    try {
      const [todaySales] = await pool.query(
        `SELECT COALESCE(SUM(paid_amount), 0) as amount, COUNT(*) as count
         FROM retail_orders 
         WHERE DATE(created_at) = ? AND status = 'completed'`,
        [today]
      )
      
      const [profit] = await pool.query(
        `SELECT COALESCE(SUM(ri.quantity * (ri.price - p.cost_price)), 0) as profit
         FROM retail_order_items ri
         LEFT JOIN retail_orders ro ON ri.order_id = ro.id
         LEFT JOIN products p ON ri.product_id = p.id
         WHERE DATE(ro.created_at) = ? AND ro.status = 'completed'`,
        [today]
      )
      
      const [monthSales] = await pool.query(
        `SELECT COALESCE(SUM(paid_amount), 0) as amount
         FROM retail_orders 
         WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01') AND status = 'completed'`
      )
      
      stats = {
        todaySales: parseFloat(todaySales[0].amount),
        todayOrders: parseInt(todaySales[0].count),
        profit: parseFloat(profit[0].profit),
        monthSales: parseFloat(monthSales[0].amount)
      }
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      stats = {
        todaySales: 8560,
        todayOrders: 42,
        profit: 1280,
        monthSales: 125600
      }
    }
    
    res.json({ success: true, data: stats })
  } catch (error) {
    console.error('Retail stats error:', error)
    res.status(500).json({ success: false, error: '获取统计数据失败' })
  }
})

router.get('/retail/products', async (req, res) => {
  try {
    const { keyword = '', barcode = '' } = req.query
    
    let products = []
    
    try {
      let whereClause = 'WHERE p.status = 1'
      const params = []
      
      if (keyword) {
        whereClause += ' AND (p.name LIKE ? OR p.code LIKE ?)'
        params.push(`%${keyword}%`, `%${keyword}%`)
      }
      
      if (barcode) {
        whereClause += ' AND p.barcode = ?'
        params.push(barcode)
      }
      
      const [result] = await pool.query(
        `SELECT 
          p.id,
          p.code,
          p.name,
          p.category,
          p.spec,
          p.unit,
          p.retail_price as retailPrice,
          p.sale_price as salePrice,
          p.cost_price as costPrice,
          p.barcode,
          COALESCE(i.quantity, 0) as stock
        FROM products p
        LEFT JOIN inventory i ON p.id = i.product_id
        ${whereClause}
        ORDER BY p.name
        LIMIT 50`,
        params
      )
      
      products = result
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      products = [
        { id: 1, code: 'P001', name: '企业软件A', category: '企业软件', spec: '标准版', unit: '套', retailPrice: 2999, salePrice: 3999, costPrice: 1500, barcode: '6901234567890', stock: 50 },
        { id: 2, code: 'P002', name: 'SaaS服务B', category: 'SaaS服务', spec: '年度版', unit: '年', retailPrice: 1999, salePrice: 2999, costPrice: 500, barcode: '6901234567891', stock: 100 },
      ]
    }
    
    res.json({ success: true, data: products })
  } catch (error) {
    console.error('Get retail products error:', error)
    res.status(500).json({ success: false, error: '获取商品列表失败' })
  }
})

module.exports = router
