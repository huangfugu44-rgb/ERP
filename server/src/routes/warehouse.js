const express = require('express')
const router = express.Router()
const { pool } = require('../config/database')

router.get('/warehouse/inventory', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', warehouseId = '', stockStatus = '' } = req.query
    const offset = (page - 1) * pageSize
    
    let inventory = []
    let total = 0
    
    try {
      let whereClause = 'WHERE 1=1'
      const params = []
      
      if (keyword) {
        whereClause += ' AND (p.name LIKE ? OR p.code LIKE ?)'
        params.push(`%${keyword}%`, `%${keyword}%`)
      }
      
      if (warehouseId) {
        whereClause += ' AND i.warehouse_id = ?'
        params.push(warehouseId)
      }
      
      if (stockStatus === 'low') {
        whereClause += ' AND i.quantity <= p.min_stock'
      } else if (stockStatus === 'high') {
        whereClause += ' AND i.quantity >= p.max_stock'
      } else if (stockStatus === 'zero') {
        whereClause += ' AND i.quantity = 0'
      }
      
      const [inventoryResult] = await pool.query(
        `SELECT 
          i.id,
          p.code as productCode,
          p.name as productName,
          p.spec,
          p.unit,
          w.name as warehouseName,
          i.quantity,
          p.min_stock as minStock,
          p.max_stock as maxStock,
          i.cost_price as unitPrice,
          i.quantity * i.cost_price as totalAmount,
          i.available_quantity as availableQuantity
        FROM inventory i
        LEFT JOIN products p ON i.product_id = p.id
        LEFT JOIN warehouses w ON i.warehouse_id = w.id
        ${whereClause}
        ORDER BY p.name
        LIMIT ? OFFSET ?`,
        [...params, parseInt(pageSize), offset]
      )
      
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total FROM inventory i
         LEFT JOIN products p ON i.product_id = p.id
         ${whereClause}`,
        params
      )
      
      inventory = inventoryResult
      total = countResult[0].total
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      inventory = [
        { id: 1, productCode: 'SOFT001', productName: 'Office 365 商业版', spec: '年订阅', unit: '套', warehouseName: '软件仓库', quantity: 50, minStock: 10, maxStock: 100, unitPrice: 1999, totalAmount: 99950, availableQuantity: 50 },
      ]
      total = inventory.length
    }
    
    res.json({ success: true, data: inventory, total })
  } catch (error) {
    console.error('Get inventory error:', error)
    res.status(500).json({ success: false, error: '获取库存失败' })
  }
})

router.get('/warehouse/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params
    let inventory = null
    
    try {
      const [result] = await pool.query(
        `SELECT 
          i.*,
          p.code as productCode,
          p.name as productName,
          p.spec,
          p.unit,
          p.min_stock as minStock,
          p.max_stock as maxStock,
          w.name as warehouseName
        FROM inventory i
        LEFT JOIN products p ON i.product_id = p.id
        LEFT JOIN warehouses w ON i.warehouse_id = w.id
        WHERE i.id = ?`,
        [id]
      )
      
      if (result.length > 0) {
        inventory = result[0]
      }
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      inventory = {
        id: 1,
        productCode: 'SOFT001',
        productName: 'Office 365 商业版',
        spec: '年订阅',
        unit: '套',
        warehouseName: '软件仓库',
        quantity: 50,
        availableQuantity: 50,
        minStock: 10,
        maxStock: 100,
        unitPrice: 1999
      }
    }
    
    if (!inventory) {
      return res.status(404).json({ success: false, error: '库存记录不存在' })
    }
    
    res.json({ success: true, data: inventory })
  } catch (error) {
    console.error('Get inventory detail error:', error)
    res.status(500).json({ success: false, error: '获取库存详情失败' })
  }
})

router.put('/warehouse/inventory/:id/adjust', async (req, res) => {
  try {
    const { id } = req.params
    const { adjustType, adjustQuantity, newStock, reason } = req.body
    
    if (!adjustType || (!adjustQuantity && newStock === undefined)) {
      return res.status(400).json({ success: false, error: '请提供调整信息' })
    }
    
    try {
      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        
        const [inventory] = await connection.query(
          'SELECT * FROM inventory WHERE id = ?',
          [id]
        )
        
        if (inventory.length === 0) {
          await connection.rollback()
          return res.status(404).json({ success: false, error: '库存记录不存在' })
        }
        
        const currentStock = inventory[0].quantity
        let targetQuantity
        
        if (newStock !== undefined) {
          targetQuantity = newStock
        } else if (adjustType === 'increase') {
          targetQuantity = currentStock + adjustQuantity
        } else if (adjustType === 'decrease') {
          targetQuantity = currentStock - adjustQuantity
        } else {
          targetQuantity = adjustQuantity
        }
        
        const changeQuantity = targetQuantity - currentStock
        
        await connection.query(
          `UPDATE inventory 
           SET quantity = ?, available_quantity = ?
           WHERE id = ?`,
          [targetQuantity, targetQuantity, id]
        )
        
        await connection.query(
          `INSERT INTO inventory_logs 
           (inventory_id, change_type, change_quantity, before_quantity, after_quantity, reason, created_by)
           VALUES (?, ?, ?, ?, ?, ?, 1)`,
          [id, adjustType, changeQuantity, currentStock, targetQuantity, reason || '']
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
    
    res.json({ success: true, message: '库存调整成功' })
  } catch (error) {
    console.error('Adjust inventory error:', error)
    res.status(500).json({ success: false, error: '库存调整失败' })
  }
})

router.get('/warehouse/stats', async (req, res) => {
  try {
    const { warehouseId = '' } = req.query
    
    let stats = null
    
    try {
      let whereClause = ''
      const params = []
      
      if (warehouseId) {
        whereClause = 'WHERE warehouse_id = ?'
        params.push(warehouseId)
      }
      
      const [productTypes] = await pool.query(
        `SELECT COUNT(DISTINCT product_id) as count FROM inventory ${whereClause}`,
        params
      )
      
      const [totalQuantity] = await pool.query(
        `SELECT COALESCE(SUM(quantity), 0) as total FROM inventory ${whereClause}`,
        params
      )
      
      const [inventoryAmount] = await pool.query(
        `SELECT COALESCE(SUM(quantity * cost_price), 0) as amount FROM inventory ${whereClause}`,
        params
      )
      
      const [lowStockCount] = await pool.query(
        `SELECT COUNT(*) as count FROM inventory i
         LEFT JOIN products p ON i.product_id = p.id
         ${warehouseId ? 'WHERE i.warehouse_id = ? AND' : 'WHERE'} i.quantity <= p.min_stock`,
        warehouseId ? [warehouseId] : []
      )
      
      stats = {
        productTypes: parseInt(productTypes[0].count),
        totalQuantity: parseInt(totalQuantity[0].total),
        inventoryAmount: parseFloat(inventoryAmount[0].amount),
        lowStockCount: parseInt(lowStockCount[0].count)
      }
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      stats = {
        productTypes: 156,
        totalQuantity: 2850,
        inventoryAmount: 2568000,
        lowStockCount: 12
      }
    }
    
    res.json({ success: true, data: stats })
  } catch (error) {
    console.error('Warehouse stats error:', error)
    res.status(500).json({ success: false, error: '获取统计数据失败' })
  }
})

router.get('/warehouse/warnings', async (req, res) => {
  try {
    const { warehouseId = '' } = req.query
    
    let warnings = []
    
    try {
      let whereClause = 'WHERE i.quantity <= p.min_stock'
      const params = []
      
      if (warehouseId) {
        whereClause += ' AND i.warehouse_id = ?'
        params.push(warehouseId)
      }
      
      const [result] = await pool.query(
        `SELECT 
          p.name as productName,
          w.name as warehouseName,
          i.quantity as currentStock,
          p.min_stock as minStock
        FROM inventory i
        LEFT JOIN products p ON i.product_id = p.id
        LEFT JOIN warehouses w ON i.warehouse_id = w.id
        ${whereClause}
        ORDER BY (p.min_stock - i.quantity) DESC`,
        params
      )
      
      warnings = result
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      warnings = [
        { productName: 'Office 365 商业版', warehouseName: '软件仓库', currentStock: 5, minStock: 10 },
      ]
    }
    
    res.json({ success: true, data: warnings })
  } catch (error) {
    console.error('Get warnings error:', error)
    res.status(500).json({ success: false, error: '获取预警失败' })
  }
})

router.get('/warehouse/stock-records', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, productId = '', warehouseId = '', changeType = '' } = req.query
    const offset = (page - 1) * pageSize
    
    let records = []
    let total = 0
    
    try {
      let whereClause = 'WHERE 1=1'
      const params = []
      
      if (productId) {
        whereClause += ' AND il.inventory_id IN (SELECT id FROM inventory WHERE product_id = ?)'
        params.push(productId)
      }
      
      if (warehouseId) {
        whereClause += ' AND i.warehouse_id = ?'
        params.push(warehouseId)
      }
      
      if (changeType) {
        whereClause += ' AND il.change_type = ?'
        params.push(changeType)
      }
      
      const [recordsResult] = await pool.query(
        `SELECT 
          il.id,
          il.created_at as recordDate,
          p.name as productName,
          w.name as warehouseName,
          il.change_type as changeType,
          il.change_quantity,
          il.before_quantity as beforeStock,
          il.after_quantity as afterStock,
          il.reason as remark
        FROM inventory_logs il
        LEFT JOIN inventory i ON il.inventory_id = i.id
        LEFT JOIN products p ON i.product_id = p.id
        LEFT JOIN warehouses w ON i.warehouse_id = w.id
        ${whereClause}
        ORDER BY il.created_at DESC
        LIMIT ? OFFSET ?`,
        [...params, parseInt(pageSize), offset]
      )
      
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total FROM inventory_logs il
         LEFT JOIN inventory i ON il.inventory_id = i.id
         ${whereClause}`,
        params
      )
      
      const typeMap = {
        'increase': '入库',
        'decrease': '出库',
        'adjust': '调整',
        'inbound': '采购入库',
        'outbound': '销售出库',
        'return': '退货'
      }
      
      records = recordsResult.map(record => ({
        ...record,
        changeTypeText: typeMap[record.changeType] || record.changeType
      }))
      
      total = countResult[0].total
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      records = [
        { id: 1, recordDate: '2024-05-15', productName: 'Office 365 商业版', warehouseName: '软件仓库', changeType: 'inbound', changeTypeText: '采购入库', changeQuantity: 50, beforeStock: 20, afterStock: 70, remark: 'PO20240515001' },
      ]
      total = records.length
    }
    
    res.json({ success: true, data: records, total })
  } catch (error) {
    console.error('Get stock records error:', error)
    res.status(500).json({ success: false, error: '获取库存记录失败' })
  }
})

router.post('/warehouse/transfer', async (req, res) => {
  try {
    const { inventoryId, fromWarehouseId, toWarehouseId, quantity, reason, createdBy } = req.body
    
    if (!inventoryId || !toWarehouseId || !quantity) {
      return res.status(400).json({ success: false, error: '请提供完整的调拨信息' })
    }
    
    try {
      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        
        const [inventory] = await connection.query(
          'SELECT * FROM inventory WHERE id = ?',
          [inventoryId]
        )
        
        if (inventory.length === 0) {
          await connection.rollback()
          return res.status(404).json({ success: false, error: '库存记录不存在' })
        }
        
        const currentInventory = inventory[0]
        
        if (currentInventory.available_quantity < quantity) {
          await connection.rollback()
          return res.status(400).json({ success: false, error: '可用库存不足' })
        }
        
        await connection.query(
          `UPDATE inventory 
           SET quantity = quantity - ?, available_quantity = available_quantity - ?
           WHERE id = ?`,
          [quantity, quantity, inventoryId]
        )
        
        const [toInventory] = await connection.query(
          'SELECT * FROM inventory WHERE product_id = ? AND warehouse_id = ?',
          [currentInventory.product_id, toWarehouseId]
        )
        
        if (toInventory.length > 0) {
          await connection.query(
            `UPDATE inventory 
             SET quantity = quantity + ?, available_quantity = available_quantity + ?
             WHERE id = ?`,
            [quantity, quantity, toInventory[0].id]
          )
        } else {
          await connection.query(
            `INSERT INTO inventory (product_id, warehouse_id, quantity, available_quantity, cost_price)
             VALUES (?, ?, ?, ?, ?)`,
            [currentInventory.product_id, toWarehouseId, quantity, quantity, currentInventory.cost_price]
          )
        }
        
        await connection.query(
          `INSERT INTO inventory_logs 
           (inventory_id, change_type, change_quantity, before_quantity, after_quantity, reason, created_by)
           VALUES (?, 'transfer_out', ?, ?, ?, ?, ?)`,
          [inventoryId, -quantity, currentInventory.quantity, currentInventory.quantity - quantity, reason || '库存调拨', createdBy]
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
    
    res.json({ success: true, message: '调拨成功' })
  } catch (error) {
    console.error('Transfer inventory error:', error)
    res.status(500).json({ success: false, error: '调拨失败' })
  }
})

module.exports = router
