const express = require('express')
const router = express.Router()
const { pool } = require('../config/database')

router.get('/suppliers', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', status = '' } = req.query
    const offset = (page - 1) * pageSize
    
    let suppliers = []
    let total = 0
    
    try {
      let whereClause = 'WHERE 1=1'
      const params = []
      
      if (keyword) {
        whereClause += ' AND (name LIKE ? OR code LIKE ? OR contact LIKE ?)'
        params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
      }
      
      if (status) {
        whereClause += ' AND status = ?'
        params.push(status)
      }
      
      const [suppliersResult] = await pool.query(
        `SELECT 
          id,
          code,
          name,
          contact,
          phone,
          address,
          email,
          status
        FROM suppliers
        ${whereClause}
        ORDER BY name
        LIMIT ? OFFSET ?`,
        [...params, parseInt(pageSize), offset]
      )
      
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total FROM suppliers ${whereClause}`,
        params
      )
      
      suppliers = suppliersResult
      total = countResult[0].total
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      suppliers = [
        { id: 1, code: 'SUP001', name: '微软(中国)有限公司', contact: '张经理', phone: '400-820-8666', address: '北京市朝阳区', status: 1 },
      ]
      total = suppliers.length
    }
    
    res.json({ success: true, data: suppliers, total })
  } catch (error) {
    console.error('Get suppliers error:', error)
    res.status(500).json({ success: false, error: '获取供应商失败' })
  }
})

router.get('/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params
    let supplier = null
    
    try {
      const [suppliers] = await pool.query(
        'SELECT * FROM suppliers WHERE id = ?',
        [id]
      )
      
      if (suppliers.length > 0) {
        supplier = suppliers[0]
      }
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      supplier = {
        id: 1,
        code: 'SUP001',
        name: '微软(中国)有限公司',
        contact: '张经理',
        phone: '400-820-8666',
        address: '北京市朝阳区',
        status: 1
      }
    }
    
    if (!supplier) {
      return res.status(404).json({ success: false, error: '供应商不存在' })
    }
    
    res.json({ success: true, data: supplier })
  } catch (error) {
    console.error('Get supplier error:', error)
    res.status(500).json({ success: false, error: '获取供应商详情失败' })
  }
})

router.post('/supplier', async (req, res) => {
  try {
    const { code, name, contact, phone, address, email, remark, status = 1, createdBy } = req.body
    
    if (!code || !name) {
      return res.status(400).json({ success: false, error: '请提供供应商编码和名称' })
    }
    
    let supplierId = null
    
    try {
      const [result] = await pool.query(
        `INSERT INTO suppliers (code, name, contact, phone, address, email, remark, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [code, name, contact, phone, address, email, remark, status, createdBy]
      )
      
      supplierId = result.insertId
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    const supplier = {
      id: supplierId,
      code,
      name,
      contact,
      phone,
      address,
      status
    }
    
    res.json({ success: true, data: supplier, message: '供应商创建成功' })
  } catch (error) {
    console.error('Create supplier error:', error)
    res.status(500).json({ success: false, error: '创建供应商失败' })
  }
})

router.put('/supplier/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { code, name, contact, phone, address, email, remark, status } = req.body
    
    try {
      await pool.query(
        `UPDATE suppliers 
         SET code = ?, name = ?, contact = ?, phone = ?, address = ?, email = ?, remark = ?, status = ?
         WHERE id = ?`,
        [code, name, contact, phone, address, email, remark, status, id]
      )
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    res.json({ success: true, message: '供应商更新成功' })
  } catch (error) {
    console.error('Update supplier error:', error)
    res.status(500).json({ success: false, error: '更新供应商失败' })
  }
})

router.delete('/supplier/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    try {
      await pool.query(
        'UPDATE suppliers SET status = 0 WHERE id = ?',
        [id]
      )
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    res.json({ success: true, message: '供应商删除成功' })
  } catch (error) {
    console.error('Delete supplier error:', error)
    res.status(500).json({ success: false, error: '删除供应商失败' })
  }
})

router.get('/customers', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', status = '' } = req.query
    const offset = (page - 1) * pageSize
    
    let customers = []
    let total = 0
    
    try {
      let whereClause = 'WHERE 1=1'
      const params = []
      
      if (keyword) {
        whereClause += ' AND (name LIKE ? OR code LIKE ? OR contact LIKE ?)'
        params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
      }
      
      if (status) {
        whereClause += ' AND status = ?'
        params.push(status)
      }
      
      const [customersResult] = await pool.query(
        `SELECT 
          c.id,
          c.code,
          c.name,
          c.contact,
          c.phone,
          c.address,
          c.email,
          c.receivable,
          c.status,
          COALESCE(SUM(so.total_amount - COALESCE(so.received_amount, 0)), 0) as receivable
        FROM customers c
        LEFT JOIN sales_orders so ON c.id = so.customer_id AND so.status != 'cancelled'
        ${whereClause}
        GROUP BY c.id
        ORDER BY c.name
        LIMIT ? OFFSET ?`,
        [...params, parseInt(pageSize), offset]
      )
      
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total FROM customers ${whereClause}`,
        params
      )
      
      customers = customersResult
      total = countResult[0].total
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      customers = [
        { id: 1, code: 'CUS001', name: '深圳市科技有限公司', contact: '张经理', phone: '0755-12345678', receivable: 58000, status: 1 },
      ]
      total = customers.length
    }
    
    res.json({ success: true, data: customers, total })
  } catch (error) {
    console.error('Get customers error:', error)
    res.status(500).json({ success: false, error: '获取客户失败' })
  }
})

router.get('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params
    let customer = null
    
    try {
      const [customers] = await pool.query(
        'SELECT * FROM customers WHERE id = ?',
        [id]
      )
      
      if (customers.length > 0) {
        customer = customers[0]
      }
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      customer = {
        id: 1,
        code: 'CUS001',
        name: '深圳市科技有限公司',
        contact: '张经理',
        phone: '0755-12345678',
        status: 1
      }
    }
    
    if (!customer) {
      return res.status(404).json({ success: false, error: '客户不存在' })
    }
    
    res.json({ success: true, data: customer })
  } catch (error) {
    console.error('Get customer error:', error)
    res.status(500).json({ success: false, error: '获取客户详情失败' })
  }
})

router.post('/customer', async (req, res) => {
  try {
    const { code, name, contact, phone, address, email, taxNo, bank, accountNo, remark, status = 1, createdBy } = req.body
    
    if (!code || !name) {
      return res.status(400).json({ success: false, error: '请提供客户编码和名称' })
    }
    
    let customerId = null
    
    try {
      const [result] = await pool.query(
        `INSERT INTO customers (code, name, contact, phone, address, email, tax_no, bank, account_no, remark, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [code, name, contact, phone, address, email, taxNo, bank, accountNo, remark, status, createdBy]
      )
      
      customerId = result.insertId
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    const customer = {
      id: customerId,
      code,
      name,
      contact,
      phone,
      status
    }
    
    res.json({ success: true, data: customer, message: '客户创建成功' })
  } catch (error) {
    console.error('Create customer error:', error)
    res.status(500).json({ success: false, error: '创建客户失败' })
  }
})

router.put('/customer/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { code, name, contact, phone, address, email, taxNo, bank, accountNo, remark, status } = req.body
    
    try {
      await pool.query(
        `UPDATE customers 
         SET code = ?, name = ?, contact = ?, phone = ?, address = ?, email = ?, 
             tax_no = ?, bank = ?, account_no = ?, remark = ?, status = ?
         WHERE id = ?`,
        [code, name, contact, phone, address, email, taxNo, bank, accountNo, remark, status, id]
      )
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    res.json({ success: true, message: '客户更新成功' })
  } catch (error) {
    console.error('Update customer error:', error)
    res.status(500).json({ success: false, error: '更新客户失败' })
  }
})

router.delete('/customer/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    try {
      await pool.query(
        'UPDATE customers SET status = 0 WHERE id = ?',
        [id]
      )
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    res.json({ success: true, message: '客户删除成功' })
  } catch (error) {
    console.error('Delete customer error:', error)
    res.status(500).json({ success: false, error: '删除客户失败' })
  }
})

router.get('/warehouses', async (req, res) => {
  try {
    const { keyword = '', status = '' } = req.query
    
    let warehouses = []
    
    try {
      let whereClause = 'WHERE 1=1'
      const params = []
      
      if (keyword) {
        whereClause += ' AND (name LIKE ? OR code LIKE ?)'
        params.push(`%${keyword}%`, `%${keyword}%`)
      }
      
      if (status) {
        whereClause += ' AND status = ?'
        params.push(status)
      }
      
      const [result] = await pool.query(
        `SELECT 
          w.id,
          w.code,
          w.name,
          w.address,
          w.manager,
          w.phone,
          w.status,
          COUNT(i.id) as productCount,
          COALESCE(SUM(i.quantity), 0) as totalQuantity
        FROM warehouses w
        LEFT JOIN inventory i ON w.id = i.warehouse_id
        ${whereClause}
        GROUP BY w.id
        ORDER BY w.name`,
        params
      )
      
      warehouses = result
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      warehouses = [
        { id: 1, code: 'WH001', name: '主仓库', address: '深圳市南山区', manager: '张三', phone: '0755-88888888', productCount: 120, totalQuantity: 2850, status: 1 },
      ]
    }
    
    res.json({ success: true, data: warehouses })
  } catch (error) {
    console.error('Get warehouses error:', error)
    res.status(500).json({ success: false, error: '获取仓库失败' })
  }
})

router.get('/warehouses/:id', async (req, res) => {
  try {
    const { id } = req.params
    let warehouse = null
    
    try {
      const [warehouses] = await pool.query(
        'SELECT * FROM warehouses WHERE id = ?',
        [id]
      )
      
      if (warehouses.length > 0) {
        warehouse = warehouses[0]
      }
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      warehouse = {
        id: 1,
        code: 'WH001',
        name: '主仓库',
        address: '深圳市南山区',
        manager: '张三',
        phone: '0755-88888888',
        status: 1
      }
    }
    
    if (!warehouse) {
      return res.status(404).json({ success: false, error: '仓库不存在' })
    }
    
    res.json({ success: true, data: warehouse })
  } catch (error) {
    console.error('Get warehouse error:', error)
    res.status(500).json({ success: false, error: '获取仓库详情失败' })
  }
})

router.post('/warehouse', async (req, res) => {
  try {
    const { code, name, address, manager, phone, remark, status = 1, createdBy } = req.body
    
    if (!code || !name) {
      return res.status(400).json({ success: false, error: '请提供仓库编码和名称' })
    }
    
    let warehouseId = null
    
    try {
      const [result] = await pool.query(
        `INSERT INTO warehouses (code, name, address, manager, phone, remark, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [code, name, address, manager, phone, remark, status, createdBy]
      )
      
      warehouseId = result.insertId
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    const warehouse = {
      id: warehouseId,
      code,
      name,
      address,
      manager,
      status
    }
    
    res.json({ success: true, data: warehouse, message: '仓库创建成功' })
  } catch (error) {
    console.error('Create warehouse error:', error)
    res.status(500).json({ success: false, error: '创建仓库失败' })
  }
})

router.put('/warehouse/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { code, name, address, manager, phone, remark, status } = req.body
    
    try {
      await pool.query(
        `UPDATE warehouses 
         SET code = ?, name = ?, address = ?, manager = ?, phone = ?, remark = ?, status = ?
         WHERE id = ?`,
        [code, name, address, manager, phone, remark, status, id]
      )
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    res.json({ success: true, message: '仓库更新成功' })
  } catch (error) {
    console.error('Update warehouse error:', error)
    res.status(500).json({ success: false, error: '更新仓库失败' })
  }
})

router.delete('/warehouse/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    try {
      await pool.query(
        'UPDATE warehouses SET status = 0 WHERE id = ?',
        [id]
      )
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    res.json({ success: true, message: '仓库删除成功' })
  } catch (error) {
    console.error('Delete warehouse error:', error)
    res.status(500).json({ success: false, error: '删除仓库失败' })
  }
})

router.get('/accounts', async (req, res) => {
  try {
    const { keyword = '', status = '' } = req.query
    
    let accounts = []
    
    try {
      let whereClause = 'WHERE 1=1'
      const params = []
      
      if (keyword) {
        whereClause += ' AND (name LIKE ? OR account_no LIKE ?)'
        params.push(`%${keyword}%`, `%${keyword}%`)
      }
      
      if (status) {
        whereClause += ' AND status = ?'
        params.push(status)
      }
      
      const [result] = await pool.query(
        `SELECT 
          id,
          name,
          account_no as accountNo,
          bank_name as bankName,
          initial_balance as initialBalance,
          current_balance as currentBalance,
          status
        FROM accounts
        ${whereClause}
        ORDER BY name`,
        params
      )
      
      accounts = result
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      accounts = [
        { id: 1, name: '中国银行基本户', accountNo: '621700******4567', bankName: '中国银行深圳分行', initialBalance: 100000, currentBalance: 1256800, status: 1 },
      ]
    }
    
    res.json({ success: true, data: accounts })
  } catch (error) {
    console.error('Get accounts error:', error)
    res.status(500).json({ success: false, error: '获取账户失败' })
  }
})

router.get('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params
    let account = null
    
    try {
      const [accounts] = await pool.query(
        'SELECT * FROM accounts WHERE id = ?',
        [id]
      )
      
      if (accounts.length > 0) {
        account = accounts[0]
      }
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      account = {
        id: 1,
        name: '中国银行基本户',
        accountNo: '621700******4567',
        bankName: '中国银行深圳分行',
        initialBalance: 100000,
        currentBalance: 1256800,
        status: 1
      }
    }
    
    if (!account) {
      return res.status(404).json({ success: false, error: '账户不存在' })
    }
    
    res.json({ success: true, data: account })
  } catch (error) {
    console.error('Get account error:', error)
    res.status(500).json({ success: false, error: '获取账户详情失败' })
  }
})

router.post('/account', async (req, res) => {
  try {
    const { name, accountNo, bankName, initialBalance, remark, status = 1, createdBy } = req.body
    
    if (!name || !accountNo) {
      return res.status(400).json({ success: false, error: '请提供账户名称和账号' })
    }
    
    let accountId = null
    
    try {
      const [result] = await pool.query(
        `INSERT INTO accounts (name, account_no, bank_name, initial_balance, current_balance, remark, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, accountNo, bankName, initialBalance || 0, initialBalance || 0, remark, status, createdBy]
      )
      
      accountId = result.insertId
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    const account = {
      id: accountId,
      name,
      accountNo,
      bankName,
      status
    }
    
    res.json({ success: true, data: account, message: '账户创建成功' })
  } catch (error) {
    console.error('Create account error:', error)
    res.status(500).json({ success: false, error: '创建账户失败' })
  }
})

router.put('/account/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, accountNo, bankName, remark, status } = req.body
    
    try {
      await pool.query(
        `UPDATE accounts 
         SET name = ?, account_no = ?, bank_name = ?, remark = ?, status = ?
         WHERE id = ?`,
        [name, accountNo, bankName, remark, status, id]
      )
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    res.json({ success: true, message: '账户更新成功' })
  } catch (error) {
    console.error('Update account error:', error)
    res.status(500).json({ success: false, error: '更新账户失败' })
  }
})

router.delete('/account/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    try {
      await pool.query(
        'UPDATE accounts SET status = 0 WHERE id = ?',
        [id]
      )
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    res.json({ success: true, message: '账户删除成功' })
  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json({ success: false, error: '删除账户失败' })
  }
})

module.exports = router
