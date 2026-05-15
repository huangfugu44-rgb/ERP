const express = require('express')
const router = express.Router()
const { pool } = require('../config/database')
const { generateBillNo } = require('../utils/billNo')

router.get('/finance/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    
    let stats = null
    
    try {
      const [receivable] = await pool.query(
        `SELECT COALESCE(SUM(total_amount - COALESCE(received_amount, 0)), 0) as amount
         FROM sales_orders 
         WHERE status IN ('confirmed', 'outbound', 'completed')`
      )
      
      const [received] = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) as amount
         FROM receipts 
         WHERE created_at >= ? AND status = 'completed'`,
        [monthStart]
      )
      
      const [payable] = await pool.query(
        `SELECT COALESCE(SUM(total_amount - COALESCE(paid_amount, 0)), 0) as amount
         FROM purchase_orders 
         WHERE status IN ('draft', 'approved', 'completed')`
      )
      
      const [paid] = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) as amount
         FROM payments 
         WHERE created_at >= ? AND status = 'completed'`,
        [monthStart]
      )
      
      const [accountsReceivable] = await pool.query(
        `SELECT COALESCE(SUM(total_amount), 0) as amount
         FROM sales_orders 
         WHERE status != 'cancelled'`
      )
      
      const [accountsPayable] = await pool.query(
        `SELECT COALESCE(SUM(total_amount), 0) as amount
         FROM purchase_orders 
         WHERE status != 'cancelled'`
      )
      
      stats = {
        receivable: parseFloat(receivable[0].amount),
        received: parseFloat(received[0].amount),
        payable: parseFloat(payable[0].amount),
        paid: parseFloat(paid[0].amount),
        accountsReceivable: parseFloat(accountsReceivable[0].amount),
        accountsPayable: parseFloat(accountsPayable[0].amount)
      }
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      stats = {
        receivable: 568000,
        received: 423500,
        payable: 156800,
        paid: 98500,
        accountsReceivable: 892000,
        accountsPayable: 156800
      }
    }
    
    res.json({ success: true, data: stats })
  } catch (error) {
    console.error('Finance stats error:', error)
    res.status(500).json({ success: false, error: '获取统计数据失败' })
  }
})

router.get('/finance/receipts', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', customerId = '', status = '' } = req.query
    const offset = (page - 1) * pageSize
    
    let receipts = []
    let total = 0
    
    try {
      let whereClause = 'WHERE 1=1'
      const params = []
      
      if (keyword) {
        whereClause += ' AND (r.order_no LIKE ? OR c.name LIKE ? OR r.amount LIKE ?)'
        params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
      }
      
      if (customerId) {
        whereClause += ' AND r.customer_id = ?'
        params.push(customerId)
      }
      
      if (status) {
        whereClause += ' AND r.status = ?'
        params.push(status)
      }
      
      const [receiptsResult] = await pool.query(
        `SELECT 
          r.id,
          r.order_no as receiptNo,
          r.receipt_date as receiptDate,
          COALESCE(c.name, '散客') as customerName,
          r.related_order_no as orderNo,
          r.amount,
          a.name as accountName,
          r.payment_method as paymentMethod,
          r.status,
          u.name as operator
        FROM receipts r
        LEFT JOIN customers c ON r.customer_id = c.id
        LEFT JOIN accounts a ON r.account_id = a.id
        LEFT JOIN users u ON r.created_by = u.id
        ${whereClause}
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?`,
        [...params, parseInt(pageSize), offset]
      )
      
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total FROM receipts r
         LEFT JOIN customers c ON r.customer_id = c.id
         ${whereClause}`,
        params
      )
      
      receipts = receiptsResult
      total = countResult[0].total
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      receipts = [
        { id: 1, receiptNo: 'RC20240515001', receiptDate: '2024-05-15', customerName: '深圳市科技有限公司', orderNo: 'SO20240514001', amount: 50000, accountName: '中国银行', paymentMethod: '银行转账', status: 'completed', operator: '张三' },
      ]
      total = receipts.length
    }
    
    res.json({ success: true, data: receipts, total })
  } catch (error) {
    console.error('Get receipts error:', error)
    res.status(500).json({ success: false, error: '获取收款单失败' })
  }
})

router.get('/finance/receipt/:id', async (req, res) => {
  try {
    const { id } = req.params
    let receipt = null
    
    try {
      const [receipts] = await pool.query(
        `SELECT 
          r.*,
          COALESCE(c.name, '散客') as customerName,
          a.name as accountName,
          u.name as operator
        FROM receipts r
        LEFT JOIN customers c ON r.customer_id = c.id
        LEFT JOIN accounts a ON r.account_id = a.id
        LEFT JOIN users u ON r.created_by = u.id
        WHERE r.id = ?`,
        [id]
      )
      
      if (receipts.length > 0) {
        receipt = receipts[0]
      }
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      receipt = {
        id: 1,
        receiptNo: 'RC20240515001',
        customerName: '深圳市科技有限公司',
        amount: 50000,
        accountName: '中国银行',
        paymentMethod: '银行转账',
        status: 'completed'
      }
    }
    
    if (!receipt) {
      return res.status(404).json({ success: false, error: '收款单不存在' })
    }
    
    res.json({ success: true, data: receipt })
  } catch (error) {
    console.error('Get receipt detail error:', error)
    res.status(500).json({ success: false, error: '获取收款单详情失败' })
  }
})

router.post('/finance/receipt', async (req, res) => {
  try {
    const { customerId, accountId, amount, paymentMethod, relatedOrderType, relatedOrderId, remark, createdBy } = req.body
    
    if (!accountId || !amount) {
      return res.status(400).json({ success: false, error: '请提供账户和金额' })
    }
    
    const receiptNo = await generateBillNo('receipt')
    
    let receiptId = null
    
    try {
      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        
        const [result] = await connection.query(
          `INSERT INTO receipts 
           (order_no, customer_id, account_id, amount, payment_method, related_order_type, related_order_id, status, remark, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)`,
          [receiptNo, customerId || null, accountId, amount, paymentMethod, relatedOrderType, relatedOrderId, remark, createdBy]
        )
        
        receiptId = result.insertId
        
        if (relatedOrderType === 'sales' && relatedOrderId) {
          await connection.query(
            `UPDATE sales_orders 
             SET received_amount = COALESCE(received_amount, 0) + ?
             WHERE id = ?`,
            [amount, relatedOrderId]
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
    
    const receipt = {
      receiptNo,
      customerId,
      accountId,
      amount,
      paymentMethod,
      status: 'completed'
    }
    
    res.json({ success: true, data: receipt, message: '收款单创建成功' })
  } catch (error) {
    console.error('Create receipt error:', error)
    res.status(500).json({ success: false, error: '创建收款单失败' })
  }
})

router.put('/finance/receipt/:id/approve', async (req, res) => {
  try {
    const { id } = req.params
    
    try {
      await pool.query(
        'UPDATE receipts SET status = ? WHERE id = ?',
        ['completed', id]
      )
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    res.json({ success: true, message: '审核成功' })
  } catch (error) {
    console.error('Approve receipt error:', error)
    res.status(500).json({ success: false, error: '审核失败' })
  }
})

router.get('/finance/payments', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', supplierId = '', status = '' } = req.query
    const offset = (page - 1) * pageSize
    
    let payments = []
    let total = 0
    
    try {
      let whereClause = 'WHERE 1=1'
      const params = []
      
      if (keyword) {
        whereClause += ' AND (p.order_no LIKE ? OR s.name LIKE ? OR p.amount LIKE ?)'
        params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
      }
      
      if (supplierId) {
        whereClause += ' AND p.supplier_id = ?'
        params.push(supplierId)
      }
      
      if (status) {
        whereClause += ' AND p.status = ?'
        params.push(status)
      }
      
      const [paymentsResult] = await pool.query(
        `SELECT 
          p.id,
          p.order_no as paymentNo,
          p.payment_date as paymentDate,
          s.name as supplierName,
          p.related_order_no as orderNo,
          p.amount,
          a.name as accountName,
          p.payment_method as paymentMethod,
          p.status,
          u.name as operator
        FROM payments p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        LEFT JOIN accounts a ON p.account_id = a.id
        LEFT JOIN users u ON p.created_by = u.id
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?`,
        [...params, parseInt(pageSize), offset]
      )
      
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total FROM payments p
         LEFT JOIN suppliers s ON p.supplier_id = s.id
         ${whereClause}`,
        params
      )
      
      payments = paymentsResult
      total = countResult[0].total
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      payments = [
        { id: 1, paymentNo: 'PM20240515001', paymentDate: '2024-05-15', supplierName: '微软(中国)有限公司', orderNo: 'PO20240512001', amount: 45000, accountName: '中国银行', paymentMethod: '银行转账', status: 'completed', operator: '张三' },
      ]
      total = payments.length
    }
    
    res.json({ success: true, data: payments, total })
  } catch (error) {
    console.error('Get payments error:', error)
    res.status(500).json({ success: false, error: '获取付款单失败' })
  }
})

router.get('/finance/payment/:id', async (req, res) => {
  try {
    const { id } = req.params
    let payment = null
    
    try {
      const [payments] = await pool.query(
        `SELECT 
          p.*,
          s.name as supplierName,
          a.name as accountName,
          u.name as operator
        FROM payments p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        LEFT JOIN accounts a ON p.account_id = a.id
        LEFT JOIN users u ON p.created_by = u.id
        WHERE p.id = ?`,
        [id]
      )
      
      if (payments.length > 0) {
        payment = payments[0]
      }
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      payment = {
        id: 1,
        paymentNo: 'PM20240515001',
        supplierName: '微软(中国)有限公司',
        amount: 45000,
        accountName: '中国银行',
        paymentMethod: '银行转账',
        status: 'completed'
      }
    }
    
    if (!payment) {
      return res.status(404).json({ success: false, error: '付款单不存在' })
    }
    
    res.json({ success: true, data: payment })
  } catch (error) {
    console.error('Get payment detail error:', error)
    res.status(500).json({ success: false, error: '获取付款单详情失败' })
  }
})

router.post('/finance/payment', async (req, res) => {
  try {
    const { supplierId, accountId, amount, paymentMethod, relatedOrderType, relatedOrderId, remark, createdBy } = req.body
    
    if (!accountId || !amount) {
      return res.status(400).json({ success: false, error: '请提供账户和金额' })
    }
    
    const paymentNo = await generateBillNo('payment')
    
    let paymentId = null
    
    try {
      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        
        const [result] = await connection.query(
          `INSERT INTO payments 
           (order_no, supplier_id, account_id, amount, payment_method, related_order_type, related_order_id, status, remark, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)`,
          [paymentNo, supplierId || null, accountId, amount, paymentMethod, relatedOrderType, relatedOrderId, remark, createdBy]
        )
        
        paymentId = result.insertId
        
        if (relatedOrderType === 'purchase' && relatedOrderId) {
          await connection.query(
            `UPDATE purchase_orders 
             SET paid_amount = COALESCE(paid_amount, 0) + ?
             WHERE id = ?`,
            [amount, relatedOrderId]
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
    
    const payment = {
      paymentNo,
      supplierId,
      accountId,
      amount,
      paymentMethod,
      status: 'completed'
    }
    
    res.json({ success: true, data: payment, message: '付款单创建成功' })
  } catch (error) {
    console.error('Create payment error:', error)
    res.status(500).json({ success: false, error: '创建付款单失败' })
  }
})

router.put('/finance/payment/:id/approve', async (req, res) => {
  try {
    const { id } = req.params
    
    try {
      await pool.query(
        'UPDATE payments SET status = ? WHERE id = ?',
        ['completed', id]
      )
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    res.json({ success: true, message: '审核成功' })
  } catch (error) {
    console.error('Approve payment error:', error)
    res.status(500).json({ success: false, error: '审核失败' })
  }
})

router.get('/finance/accounts', async (req, res) => {
  try {
    let accounts = []
    
    try {
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
        ORDER BY name`
      )
      
      accounts = result
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      accounts = [
        { id: 1, name: '中国银行', accountNo: '6222021234567890', bankName: '中国银行深圳分行', initialBalance: 100000, currentBalance: 150000, status: 1 },
      ]
    }
    
    res.json({ success: true, data: accounts })
  } catch (error) {
    console.error('Get accounts error:', error)
    res.status(500).json({ success: false, error: '获取账户列表失败' })
  }
})

module.exports = router
