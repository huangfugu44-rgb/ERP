const express = require('express')
const router = express.Router()
const { pool } = require('../config/database')
const { generateBillNo } = require('../utils/billNo')

router.get('/sales/orders', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', customerId = '', status = '' } = req.query
    const offset = (page - 1) * pageSize
    
    let orders = []
    let total = 0
    
    try {
      let whereClause = 'WHERE 1=1'
      const params = []
      
      if (keyword) {
        whereClause += ' AND (so.order_no LIKE ? OR c.name LIKE ?)'
        params.push(`%${keyword}%`, `%${keyword}%`)
      }
      
      if (customerId) {
        whereClause += ' AND so.customer_id = ?'
        params.push(customerId)
      }
      
      if (status) {
        whereClause += ' AND so.status = ?'
        params.push(status)
      }
      
      const [ordersResult] = await pool.query(
        `SELECT 
          so.id,
          so.order_no as orderNo,
          so.order_date as orderDate,
          c.name as customerName,
          c.contact,
          c.phone,
          c.address,
          u.name as salesperson,
          so.total_amount as totalAmount,
          so.discount_amount as discountAmount,
          so.paid_amount as actualAmount,
          COALESCE(so.received_amount, 0) as receivedAmount,
          so.status,
          COUNT(soi.id) as productCount
        FROM sales_orders so
        LEFT JOIN customers c ON so.customer_id = c.id
        LEFT JOIN users u ON so.created_by = u.id
        LEFT JOIN sales_order_items soi ON so.id = soi.order_id
        ${whereClause}
        GROUP BY so.id
        ORDER BY so.created_at DESC
        LIMIT ? OFFSET ?`,
        [...params, parseInt(pageSize), offset]
      )
      
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total FROM sales_orders so
         LEFT JOIN customers c ON so.customer_id = c.id
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
        { id: 1, orderNo: 'SO20240515001', orderDate: '2024-05-15', customerName: '深圳市科技有限公司', contact: '张经理', phone: '0755-12345678', address: '深圳市南山区', salesperson: '张三', productCount: 3, totalAmount: 12597, discountAmount: 0, actualAmount: 12597, receivedAmount: 0, status: 'draft' },
        { id: 2, orderNo: 'SO20240514002', orderDate: '2024-05-14', customerName: '广州市软件企业', contact: '李经理', phone: '020-23456789', address: '广州市天河区', salesperson: '李四', productCount: 2, totalAmount: 7598, discountAmount: 500, actualAmount: 7098, receivedAmount: 5000, status: 'approved' },
      ]
      total = orders.length
    }
    
    res.json({ success: true, data: orders, total })
  } catch (error) {
    console.error('Get sales orders error:', error)
    res.status(500).json({ success: false, error: '获取销售订单失败' })
  }
})

router.get('/sales/order/:id', async (req, res) => {
  try {
    const { id } = req.params
    let order = null
    
    try {
      const [orders] = await pool.query(
        `SELECT 
          so.*,
          c.name as customerName,
          c.contact,
          c.phone,
          c.address,
          u.name as creatorName,
          w.name as warehouseName
        FROM sales_orders so
        LEFT JOIN customers c ON so.customer_id = c.id
        LEFT JOIN users u ON so.created_by = u.id
        LEFT JOIN warehouses w ON so.warehouse_id = w.id
        WHERE so.id = ?`,
        [id]
      )
      
      if (orders.length > 0) {
        order = orders[0]
        
        const [items] = await pool.query(
          `SELECT 
            soi.*,
            p.name as productName,
            p.code as productCode,
            p.spec,
            p.unit
          FROM sales_order_items soi
          LEFT JOIN products p ON soi.product_id = p.id
          WHERE soi.order_id = ?`,
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
        orderNo: 'SO20240515001',
        customerName: '深圳市科技有限公司',
        totalAmount: 12597,
        discountAmount: 0,
        actualAmount: 12597,
        status: 'draft',
        items: []
      }
    }
    
    if (!order) {
      return res.status(404).json({ success: false, error: '订单不存在' })
    }
    
    res.json({ success: true, data: order })
  } catch (error) {
    console.error('Get sales order error:', error)
    res.status(500).json({ success: false, error: '获取订单详情失败' })
  }
})

router.post('/sales/order', async (req, res) => {
  try {
    const { customerId, warehouseId, expectedDate, items, discountAmount = 0, remark, createdBy } = req.body
    
    if (!customerId) {
      return res.status(400).json({ success: false, error: '请选择客户' })
    }
    
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: '请添加商品' })
    }
    
    const orderNo = await generateBillNo('sales')
    
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
          `INSERT INTO sales_orders 
           (order_no, customer_id, warehouse_id, expected_date, total_amount, discount_amount, paid_amount, status, remark, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)`,
          [orderNo, customerId, warehouseId || 1, expectedDate || null, totalAmount, discountAmount, paidAmount, remark, createdBy]
        )
        
        orderId = orderResult.insertId
        
        for (const item of items) {
          await connection.query(
            `INSERT INTO sales_order_items (order_id, product_id, warehouse_id, quantity, price, amount)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [orderId, item.productId, warehouseId || 1, item.quantity, item.price, item.quantity * item.price]
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
      customerId,
      totalAmount,
      discountAmount,
      actualAmount: totalAmount - discountAmount,
      status: 'draft',
      items
    }
    
    res.json({ success: true, data: order, message: '销售订单创建成功' })
  } catch (error) {
    console.error('Create sales order error:', error)
    res.status(500).json({ success: false, error: '创建销售订单失败' })
  }
})

router.put('/sales/order/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { items, discountAmount, remark, expectedDate } = req.body
    
    try {
      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        
        let totalAmount = 0
        for (const item of items) {
          totalAmount += item.quantity * item.price
        }
        
        await connection.query(
          `UPDATE sales_orders 
           SET total_amount = ?, discount_amount = ?, paid_amount = total_amount - ?, remark = ?, expected_date = ?
           WHERE id = ?`,
          [totalAmount, discountAmount || 0, discountAmount || 0, remark, expectedDate, id]
        )
        
        await connection.query('DELETE FROM sales_order_items WHERE order_id = ?', [id])
        
        for (const item of items) {
          await connection.query(
            `INSERT INTO sales_order_items (order_id, product_id, warehouse_id, quantity, price, amount)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, item.productId, item.warehouseId || 1, item.quantity, item.price, item.quantity * item.price]
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
    
    res.json({ success: true, message: '订单更新成功' })
  } catch (error) {
    console.error('Update sales order error:', error)
    res.status(500).json({ success: false, error: '更新订单失败' })
  }
})

router.put('/sales/order/:id/approve', async (req, res) => {
  try {
    const { id } = req.params
    
    try {
      await pool.query(
        'UPDATE sales_orders SET status = ? WHERE id = ?',
        ['confirmed', id]
      )
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    res.json({ success: true, message: '审核成功' })
  } catch (error) {
    console.error('Approve sales order error:', error)
    res.status(500).json({ success: false, error: '审核失败' })
  }
})

router.put('/sales/order/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params
    
    try {
      await pool.query(
        'UPDATE sales_orders SET status = ? WHERE id = ?',
        ['cancelled', id]
      )
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    res.json({ success: true, message: '订单已取消' })
  } catch (error) {
    console.error('Cancel sales order error:', error)
    res.status(500).json({ success: false, error: '取消订单失败' })
  }
})

router.get('/sales/outbounds', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', status = '' } = req.query
    const offset = (page - 1) * pageSize
    
    let outbounds = []
    let total = 0
    
    try {
      let whereClause = 'WHERE 1=1'
      const params = []
      
      if (keyword) {
        whereClause += ' AND (sx.outbound_no LIKE ? OR c.name LIKE ? OR so.order_no LIKE ?)'
        params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
      }
      
      if (status) {
        whereClause += ' AND sx.status = ?'
        params.push(status)
      }
      
      const [outboundsResult] = await pool.query(
        `SELECT 
          sx.id,
          sx.outbound_no as outboundNo,
          so.order_no as orderNo,
          sx.outbound_date as outboundDate,
          c.name as customerName,
          w.name as warehouseName,
          sx.total_quantity as totalQuantity,
          sx.total_amount as amount,
          sx.status
        FROM sales_outbounds sx
        LEFT JOIN sales_orders so ON sx.order_id = so.id
        LEFT JOIN customers c ON so.customer_id = c.id
        LEFT JOIN warehouses w ON sx.warehouse_id = w.id
        ${whereClause}
        ORDER BY sx.created_at DESC
        LIMIT ? OFFSET ?`,
        [...params, parseInt(pageSize), offset]
      )
      
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total FROM sales_outbounds sx
         LEFT JOIN sales_orders so ON sx.order_id = so.id
         LEFT JOIN customers c ON so.customer_id = c.id
         ${whereClause}`,
        params
      )
      
      outbounds = outboundsResult
      total = countResult[0].total
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      outbounds = [
        { id: 1, outboundNo: 'SOUT20240515001', orderNo: 'SO20240514001', outboundDate: '2024-05-15', customerName: '深圳市科技有限公司', warehouseName: '软件仓库', totalQuantity: 50, amount: 45000, status: 'completed' },
      ]
      total = outbounds.length
    }
    
    res.json({ success: true, data: outbounds, total })
  } catch (error) {
    console.error('Get sales outbounds error:', error)
    res.status(500).json({ success: false, error: '获取销售出库失败' })
  }
})

router.get('/sales/outbound/:id', async (req, res) => {
  try {
    const { id } = req.params
    let outbound = null
    
    try {
      const [outbounds] = await pool.query(
        `SELECT 
          sx.*,
          so.order_no as orderNo,
          c.name as customerName,
          c.contact,
          c.phone,
          c.address,
          w.name as warehouseName
        FROM sales_outbounds sx
        LEFT JOIN sales_orders so ON sx.order_id = so.id
        LEFT JOIN customers c ON so.customer_id = c.id
        LEFT JOIN warehouses w ON sx.warehouse_id = w.id
        WHERE sx.id = ?`,
        [id]
      )
      
      if (outbounds.length > 0) {
        outbound = outbounds[0]
        
        const [items] = await pool.query(
          `SELECT 
            sxi.*,
            p.name as productName,
            p.code as productCode,
            p.spec,
            p.unit
          FROM sales_outbound_items sxi
          LEFT JOIN products p ON sxi.product_id = p.id
          WHERE sxi.outbound_id = ?`,
          [id]
        )
        
        outbound.items = items
      }
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      outbound = {
        id: 1,
        outboundNo: 'SOUT20240515001',
        orderNo: 'SO20240514001',
        customerName: '深圳市科技有限公司',
        warehouseName: '软件仓库',
        status: 'completed',
        items: []
      }
    }
    
    if (!outbound) {
      return res.status(404).json({ success: false, error: '出库单不存在' })
    }
    
    res.json({ success: true, data: outbound })
  } catch (error) {
    console.error('Get sales outbound error:', error)
    res.status(500).json({ success: false, error: '获取出库单详情失败' })
  }
})

router.post('/sales/outbound', async (req, res) => {
  try {
    const { orderId, warehouseId, items, remark, createdBy } = req.body
    
    if (!orderId) {
      return res.status(400).json({ success: false, error: '请选择销售订单' })
    }
    
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: '请添加商品' })
    }
    
    const outboundNo = await generateBillNo('sales-out')
    
    let outboundId = null
    let totalAmount = 0
    let totalQuantity = 0
    
    try {
      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        
        for (const item of items) {
          totalAmount += item.quantity * item.price
          totalQuantity += item.quantity
        }
        
        const [outboundResult] = await connection.query(
          `INSERT INTO sales_outbounds 
           (outbound_no, order_id, warehouse_id, total_quantity, total_amount, status, remark, created_by)
           VALUES (?, ?, ?, ?, ?, 'completed', ?, ?)`,
          [outboundNo, orderId, warehouseId || 1, totalQuantity, totalAmount, remark, createdBy]
        )
        
        outboundId = outboundResult.insertId
        
        for (const item of items) {
          await connection.query(
            `INSERT INTO sales_outbound_items (outbound_id, product_id, warehouse_id, quantity, price, amount)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [outboundId, item.productId, warehouseId || 1, item.quantity, item.price, item.quantity * item.price]
          )
          
          await connection.query(
            `UPDATE inventory 
             SET quantity = quantity - ?, available_quantity = available_quantity - ?
             WHERE product_id = ? AND warehouse_id = ?`,
            [item.quantity, item.quantity, item.productId, warehouseId || 1]
          )
        }
        
        await connection.query(
          'UPDATE sales_orders SET status = ? WHERE id = ?',
          ['outbound', orderId]
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
    
    const outbound = {
      outboundNo,
      orderId,
      totalQuantity,
      totalAmount,
      status: 'completed',
      items
    }
    
    res.json({ success: true, data: outbound, message: '出库成功' })
  } catch (error) {
    console.error('Create sales outbound error:', error)
    res.status(500).json({ success: false, error: '出库失败' })
  }
})

router.get('/sales/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    
    let stats = null
    
    try {
      const [monthSales] = await pool.query(
        `SELECT COALESCE(SUM(total_amount), 0) as amount
         FROM sales_orders 
         WHERE created_at >= ? AND status != 'cancelled'`,
        [monthStart]
      )
      
      const [pendingOutbounds] = await pool.query(
        `SELECT COUNT(*) as count FROM sales_orders WHERE status = 'confirmed'`
      )
      
      const [receiptAmount] = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) as amount
         FROM receipts 
         WHERE created_at >= ? AND status != 'cancelled'`,
        [monthStart]
      )
      
      const [todaySales] = await pool.query(
        `SELECT COALESCE(SUM(total_amount), 0) as amount, COUNT(*) as count
         FROM sales_orders 
         WHERE DATE(created_at) = ? AND status != 'cancelled'`,
        [today]
      )
      
      stats = {
        monthSalesAmount: parseFloat(monthSales[0].amount),
        pendingOutbounds: parseInt(pendingOutbounds[0].count),
        receiptAmount: parseFloat(receiptAmount[0].amount),
        todaySalesAmount: parseFloat(todaySales[0].amount),
        todayOrderCount: parseInt(todaySales[0].count)
      }
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      stats = {
        monthSalesAmount: 568000,
        pendingOutbounds: 8,
        receiptAmount: 423500,
        todaySalesAmount: 12580,
        todayOrderCount: 86
      }
    }
    
    res.json({ success: true, data: stats })
  } catch (error) {
    console.error('Sales stats error:', error)
    res.status(500).json({ success: false, error: '获取统计数据失败' })
  }
})

router.get('/sales/orders/pending', async (req, res) => {
  try {
    let orders = []
    
    try {
      const [result] = await pool.query(
        `SELECT 
          so.id,
          so.order_no as orderNo,
          c.name as customerName,
          so.total_amount as totalAmount,
          so.expected_date as expectedDate,
          COUNT(soi.id) as productCount
        FROM sales_orders so
        LEFT JOIN customers c ON so.customer_id = c.id
        LEFT JOIN sales_order_items soi ON so.id = soi.order_id
        WHERE so.status = 'confirmed'
        GROUP BY so.id
        ORDER BY so.expected_date ASC
        LIMIT 20`
      )
      
      orders = result
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      orders = [
        { id: 1, orderNo: 'SO20240515001', customerName: '深圳市科技有限公司', totalAmount: 12597, expectedDate: '2024-05-20', productCount: 3 },
      ]
    }
    
    res.json({ success: true, data: orders })
  } catch (error) {
    console.error('Get pending sales orders error:', error)
    res.status(500).json({ success: false, error: '获取待出库订单失败' })
  }
})

module.exports = router
