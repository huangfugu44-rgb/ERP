const jwt = require('jsonwebtoken')

const JWT_SECRET = 'aierp-secret-key-2024'

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供认证令牌' })
    }

    const token = authHeader.split(' ')[1]
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      req.user = decoded
      next()
    } catch (err) {
      return res.status(401).json({ error: '无效或过期的令牌' })
    }
  } catch (error) {
    return res.status(500).json({ error: '认证检查失败' })
  }
}

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

module.exports = { authMiddleware, generateToken, JWT_SECRET }
