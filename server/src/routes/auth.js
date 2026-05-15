const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const { generateToken } = require('../middleware/auth')

const testUsers = [
  { id: 1, username: 'admin', password: 'admin123', email: 'admin@aierp.com', role: 'admin', status: 'active' },
  { id: 2, username: 'manager', password: 'manager123', email: 'manager@aierp.com', role: 'manager', status: 'active' }
]

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ error: '请提供用户名和密码' })
    }

    // 先检查测试账号
    const testUser = testUsers.find(u => u.username === username && u.password === password)
    if (testUser) {
      const token = generateToken(testUser)
      return res.json({
        success: true,
        token,
        user: {
          id: testUser.id,
          username: testUser.username,
          email: testUser.email,
          role: testUser.role
        }
      })
    }

    return res.status(401).json({ error: '用户名或密码错误' })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: '登录失败' })
  }
})

router.post('/register', async (req, res) => {
  try {
    const { username, password, email, role = 'manager' } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ error: '请提供用户名和密码' })
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username])
    
    if (existing.length > 0) {
      return res.status(400).json({ error: '用户名已存在' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    const [result] = await pool.query(
      'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, email, role]
    )

    const token = generateToken({ id: result.insertId, username, role })

    res.json({
      success: true,
      token,
      user: { id: result.insertId, username, email, role }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: '注册失败' })
  }
})

router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未授权' })
    }

    const jwt = require('jsonwebtoken')
    const { JWT_SECRET } = require('../middleware/auth')
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)

    const user = testUsers.find(u => u.id === decoded.id) || testUsers[0]

    res.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        created_at: new Date()
      }
    })
  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({ error: '获取用户信息失败' })
  }
})

module.exports = router
