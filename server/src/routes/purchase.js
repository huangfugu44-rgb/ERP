const express = require('express')
const router = express.Router()
const { pool } = require('../config/database')
const { generateBillNo } = require('../utils/billNo')

router.get('/purchase/orders', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', supplierId = '', status = '' } = req.query
    const offset = (page - 1) * pageSize
    
    let orders = []
    let total = 0
    
    try {
      let whereClause = 'WHERE 1=1'
      const params = []
      
      if (keyword) {
        whereClause += ' AND (po.order_no LIKE ? OR s.name LIKE ?)'
        params.push(`%${keyword}%`, `%${keyword}%`)
      }
      
      if (supplierId) {
        whereClause += ' AND po.supplier_id = ?'
        params.push(supplierId)
      }
      
      if (status) {
        whereClause += ' AND po.status = ?'
        params.push(status)
      }
      
      const [ordersResult] = await pool.query(
        `SELECT 
          po.id,
          po.order_no as orderNo,
          po.order_date as orderDate,
          s.name as supplierName,
          s.contact,
          s.phone,
          s.address,
          po.total_amount as totalAmount,
          po.discount_amount as discountAmount,
          po.paid_amount as actualAmount,
          po.status,
          COUNT(pi.id) as productCount
        FROM purchase_orders po
        LEFT JOIN suppliers s ON po.supplier_id = s.id
        LEFT JOIN purchase_order_items pi ON po.id = pi.order_id
        ${whereClause}
        GROUP BY po.id
        ORDER BY po.created_at DESC
        LIMIT ? OFFSET ?`,
        [...params, parseInt(pageSize), offset]
      )
      
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total FROM purchase_orders po
         LEFT JOIN suppliers s ON po.supplier_id = s.id
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
        { id: 1, orderNo: 'PO20240515001', orderDate: '2024-05-15', supplierName: '微软(中国)有限公司', contact: '张经理', phone: '13800138001', address: '深圳市南山区', productCount: 3, totalAmount: 8997, discountAmount: 0, actualAmount: 8997, status: 'draft' },
        { id: 2, orderNo: 'PO20240514002', orderDate: '2024-05-14', supplierName: 'Adobe公司', contact: '李经理', phone: '13800138002', address: '北京市朝阳区', productCount: 2, totalAmount: 5998, discountAmount: 0, actualAmount: 5998, status: 'approved' },
      ]
      total = orders.length
    }
    
    res.json({ success: true, data: orders, total })
  } catch (error) {
    console.error('Get purchase orders error:', error)
    res.status(500).json({ success: false, error: '获取采购订单失败' })
  }
})

router.get('/purchase/order/:id', async (req, res) => {
  try {
    const { id } = req.params
    let order = null
    
    try {
      const [orders] = await pool.query(
        `SELECT 
          po.*,
          s.name as supplierName,
          s.contact,
          s.phone,
          s.address,
          u.name as creatorName
        FROM purchase_orders po
        LEFT JOIN suppliers s ON po.supplier_id = s.id
        LEFT JOIN users u ON po.created_by = u.id
        WHERE po.id = ?`,
        [id]
      )
      
      if (orders.length > 0) {
        order = orders[0]
        
        const [items] = await pool.query(
          `SELECT 
            pi.*,
            p.name as productName,
            p.code as productCode,
            p.spec,
            p.unit
          FROM purchase_order_items pi
          LEFT JOIN products p ON pi.product_id = p.id
          WHERE pi.order_id = ?`,
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
        orderNo: 'PO20240515001',
        supplierName: '微软(中国)有限公司',
        totalAmount: 8997,
        discountAmount: 0,
        actualAmount: 8997,
        status: 'draft',
        items: []
      }
    }
    
    if (!order) {
      return res.status(404).json({ success: false, error: '订单不存在' })
    }
    
    res.json({ success: true, data: order })
  } catch (error) {
    console.error('Get purchase order error:', error)
    res.status(500).json({ success: false, error: '获取订单详情失败' })
  }
})

router.post('/purchase/order', async (req, res) => {
  try {
    const { supplierId, warehouseId, expectedDate, items, discountAmount = 0, remark, createdBy } = req.body
    
    if (!supplierId) {
      return res.status(400).json({ success: false, error: '请选择供应商' })
    }
    
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: '请添加商品' })
    }
    
    const orderNo = await generateBillNo('purchase')
    
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
          `INSERT INTO purchase_orders 
           (order_no, supplier_id, warehouse_id, expected_date, total_amount, discount_amount, paid_amount, status, remark, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)`,
          [orderNo, supplierId, warehouseId || 1, expectedDate || null, totalAmount, discountAmount, paidAmount, remark, createdBy]
        )
        
        orderId = orderResult.insertId
        
        for (const item of items) {
          await connection.query(
            `INSERT INTO purchase_order_items (order_id, product_id, warehouse_id, quantity, price, amount)
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
      supplierId,
      totalAmount,
      discountAmount,
      actualAmount: totalAmount - discountAmount,
      status: 'draft',
      items
    }
    
    res.json({ success: true, data: order, message: '采购订单创建成功' })
  } catch (error) {
    console.error('Create purchase order error:', error)
    res.status(500).json({ success: false, error: '创建采购订单失败' })
  }
})

router.put('/purchase/order/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { items, discountAmount, remark } = req.body
    
    try {
      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        
        let totalAmount = 0
        for (const item of items) {
          totalAmount += item.quantity * item.price
        }
        
        await connection.query(
          `UPDATE purchase_orders 
           SET total_amount = ?, discount_amount = ?, paid_amount = total_amount - ?, remark = ?
           WHERE id = ?`,
          [totalAmount, discountAmount || 0, discountAmount || 0, remark, id]
        )
        
        await connection.query('DELETE FROM purchase_order_items WHERE order_id = ?', [id])
        
        for (const item of items) {
          await connection.query(
            `INSERT INTO purchase_order_items (order_id, product_id, warehouse_id, quantity, price, amount)
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
    console.error('Update purchase order error:', error)
    res.status(500).json({ success: false, error: '更新订单失败' })
  }
})

router.put('/purchase/order/:id/approve', async (req, res) => {
  try {
    const { id } = req.params
    
    try {
      await pool.query(
        'UPDATE purchase_orders SET status = ? WHERE id = ?',
        ['approved', id]
      )
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    res.json({ success: true, message: '审核成功' })
  } catch (error) {
    console.error('Approve purchase order error:', error)
    res.status(500).json({ success: false, error: '审核失败' })
  }
})

router.put('/purchase/order/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params
    
    try {
      await pool.query(
        'UPDATE purchase_orders SET status = ? WHERE id = ?',
        ['cancelled', id]
      )
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    res.json({ success: true, message: '订单已取消' })
  } catch (error) {
    console.error('Cancel purchase order error:', error)
    res.status(500).json({ success: false, error: '取消订单失败' })
  }
})

router.get('/purchase/inbounds', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', status = '' } = req.query
    const offset = (page - 1) * pageSize
    
    let inbounds = []
    let total = 0
    
    try {
      let whereClause = 'WHERE 1=1'
      const params = []
      
      if (keyword) {
        whereClause += ' AND (pi.inbound_no LIKE ? OR s.name LIKE ? OR po.order_no LIKE ?)'
        params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
      }
      
      if (status) {
        whereClause += ' AND pi.status = ?'
        params.push(status)
      }
      
      const [inboundsResult] = await pool.query(
        `SELECT 
          pi.id,
          pi.inbound_no as inboundNo,
          po.order_no as orderNo,
          pi.inbound_date as inboundDate,
          s.name as supplierName,
          w.name as warehouseName,
          pi.total_quantity as totalQuantity,
          pi.total_amount as amount,
          pi.status
        FROM purchase_inbounds pi
        LEFT JOIN purchase_orders po ON pi.order_id = po.id
        LEFT JOIN suppliers s ON po.supplier_id = s.id
        LEFT JOIN warehouses w ON pi.warehouse_id = w.id
        ${whereClause}
        ORDER BY pi.created_at DESC
        LIMIT ? OFFSET ?`,
        [...params, parseInt(pageSize), offset]
      )
      
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total FROM purchase_inbounds pi
         LEFT JOIN purchase_orders po ON pi.order_id = po.id
         LEFT JOIN suppliers s ON po.supplier_id = s.id
         ${whereClause}`,
        params
      )
      
      inbounds = inboundsResult
      total = countResult[0].total
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      inbounds = [
        { id: 1, inboundNo: 'PI20240515001', orderNo: 'PO20240514001', inboundDate: '2024-05-15', supplierName: '微软(中国)有限公司', warehouseName: '软件仓库', totalQuantity: 50, amount: 45000, status: 'completed' },
      ]
      total = inbounds.length
    }
    
    res.json({ success: true, data: inbounds, total })
  } catch (error) {
    console.error('Get purchase inbounds error:', error)
    res.status(500).json({ success: false, error: '获取采购入库失败' })
  }
})

router.get('/purchase/inbound/:id', async (req, res) => {
  try {
    const { id } = req.params
    let inbound = null
    
    try {
      const [inbounds] = await pool.query(
        `SELECT 
          pi.*,
          po.order_no as orderNo,
          s.name as supplierName,
          w.name as warehouseName
        FROM purchase_inbounds pi
        LEFT JOIN purchase_orders po ON pi.order_id = po.id
        LEFT JOIN suppliers s ON po.supplier_id = s.id
        LEFT JOIN warehouses w ON pi.warehouse_id = w.id
        WHERE pi.id = ?`,
        [id]
      )
      
      if (inbounds.length > 0) {
        inbound = inbounds[0]
        
        const [items] = await pool.query(
          `SELECT 
            pii.*,
            p.name as productName,
            p.code as productCode,
            p.spec,
            p.unit
          FROM purchase_inbound_items pii
          LEFT JOIN products p ON pii.product_id = p.id
          WHERE pii.inbound_id = ?`,
          [id]
        )
        
        inbound.items = items
      }
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      inbound = {
        id: 1,
        inboundNo: 'PI20240515001',
        orderNo: 'PO20240514001',
        supplierName: '微软(中国)有限公司',
        warehouseName: '软件仓库',
        status: 'completed',
        items: []
      }
    }
    
    if (!inbound) {
      return res.status(404).json({ success: false, error: '入库单不存在' })
    }
    
    res.json({ success: true, data: inbound })
  } catch (error) {
    console.error('Get purchase inbound error:', error)
    res.status(500).json({ success: false, error: '获取入库单详情失败' })
  }
})

router.post('/purchase/inbound', async (req, res) => {
  try {
    const { orderId, warehouseId, items, remark, createdBy } = req.body
    
    if (!orderId) {
      return res.status(400).json({ success: false, error: '请选择采购订单' })
    }
    
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: '请添加商品' })
    }
    
    const inboundNo = await generateBillNo('purchase-in')
    
    let inboundId = null
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
        
        const [inboundResult] = await connection.query(
          `INSERT INTO purchase_inbounds 
           (inbound_no, order_id, warehouse_id, total_quantity, total_amount, status, remark, created_by)
           VALUES (?, ?, ?, ?, ?, 'completed', ?, ?)`,
          [inboundNo, orderId, warehouseId || 1, totalQuantity, totalAmount, remark, createdBy]
        )
        
        inboundId = inboundResult.insertId
        
        for (const item of items) {
          await connection.query(
            `INSERT INTO purchase_inbound_items (inbound_id, product_id, warehouse_id, quantity, price, amount)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [inboundId, item.productId, warehouseId || 1, item.quantity, item.price, item.quantity * item.price]
          )
          
          const [existing] = await connection.query(
            'SELECT id FROM inventory WHERE product_id = ? AND warehouse_id = ?',
            [item.productId, warehouseId || 1]
          )
          
          if (existing.length > 0) {
            await connection.query(
              `UPDATE inventory 
               SET quantity = quantity + ?, available_quantity = available_quantity + ?,
                   last_in_price = ?
               WHERE product_id = ? AND warehouse_id = ?`,
              [item.quantity, item.quantity, item.price, item.productId, warehouseId || 1]
            )
          } else {
            await connection.query(
              `INSERT INTO inventory (product_id, warehouse_id, quantity, available_quantity, cost_price, last_in_price)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [item.productId, warehouseId || 1, item.quantity, item.quantity, item.price, item.price]
            )
          }
        }
        
        await connection.query(
          'UPDATE purchase_orders SET status = ? WHERE id = ?',
          ['completed', orderId]
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
    
    const inbound = {
      inboundNo,
      orderId,
      totalQuantity,
      totalAmount,
      status: 'completed',
      items
    }
    
    res.json({ success: true, data: inbound, message: '入库成功' })
  } catch (error) {
    console.error('Create purchase inbound error:', error)
    res.status(500).json({ success: false, error: '入库失败' })
  }
})

router.get('/purchase/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    
    let stats = null
    
    try {
      const [monthPurchase] = await pool.query(
        `SELECT COALESCE(SUM(total_amount), 0) as amount
         FROM purchase_orders 
         WHERE created_at >= ? AND status != 'cancelled'`,
        [monthStart]
      )
      
      const [pendingInbounds] = await pool.query(
        `SELECT COUNT(*) as count FROM purchase_orders WHERE status = 'approved'`
      )
      
      const [returnAmount] = await pool.query(
        `SELECT COALESCE(SUM(total_amount), 0) as amount
         FROM purchase_returns 
         WHERE created_at >= ? AND status != 'cancelled'`,
        [monthStart]
      )
      
      stats = {
        monthPurchaseAmount: parseFloat(monthPurchase[0].amount),
        pendingInbounds: parseInt(pendingInbounds[0].count),
        returnAmount: parseFloat(returnAmount[0].amount)
      }
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      stats = {
        monthPurchaseAmount: 156800,
        pendingInbounds: 5,
        returnAmount: 12300
      }
    }
    
    res.json({ success: true, data: stats })
  } catch (error) {
    console.error('Purchase stats error:', error)
    res.status(500).json({ success: false, error: '获取统计数据失败' })
  }
})

router.get('/purchase/orders/pending', async (req, res) => {
  try {
    let orders = []
    
    try {
      const [result] = await pool.query(
        `SELECT 
          po.id,
          po.order_no as orderNo,
          s.name as supplierName,
          po.total_amount as totalAmount,
          po.expected_date as expectedDate
        FROM purchase_orders po
        LEFT JOIN suppliers s ON po.supplier_id = s.id
        WHERE po.status = 'approved'
        ORDER BY po.expected_date ASC
        LIMIT 20`
      )
      
      orders = result
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      orders = [
        { id: 1, orderNo: 'PO20240515001', supplierName: '微软(中国)有限公司', totalAmount: 8997, expectedDate: '2024-05-20' },
      ]
    }
    
    res.json({ success: true, data: orders })
  } catch (error) {
    console.error('Get pending purchase orders error:', error)
    res.status(500).json({ success: false, error: '获取待入库订单失败' })
  }
})

module.exports = router
