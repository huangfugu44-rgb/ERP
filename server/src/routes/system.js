const express = require('express')
const router = express.Router()
const { pool } = require('../config/database')

router.get('/users', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', roleId = '', status = '' } = req.query
    const offset = (page - 1) * pageSize
    
    let users = []
    let total = 0
    
    try {
      let whereClause = 'WHERE 1=1'
      const params = []
      
      if (keyword) {
        whereClause += ' AND (u.username LIKE ? OR u.real_name LIKE ? OR u.email LIKE ?)'
        params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
      }
      
      if (roleId) {
        whereClause += ' AND ur.role_id = ?'
        params.push(roleId)
      }
      
      if (status !== '') {
        whereClause += ' AND u.status = ?'
        params.push(status)
      }
      
      const [usersResult] = await pool.query(
        `SELECT 
          u.id,
          u.username,
          u.real_name as realName,
          u.email,
          u.phone,
          u.department,
          u.last_login as lastLogin,
          u.status,
          GROUP_CONCAT(r.name) as roles
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        ${whereClause}
        GROUP BY u.id
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?`,
        [...params, parseInt(pageSize), offset]
      )
      
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total FROM users u ${whereClause}`,
        params
      )
      
      users = usersResult
      total = countResult[0].total
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      users = [
        { id: 1, username: 'admin', realName: '系统管理员', email: 'admin@aierp.com', phone: '13800138000', department: '信息中心', lastLogin: '2024-05-15 10:30', status: 1, roles: '超级管理员' },
      ]
      total = users.length
    }
    
    res.json({ success: true, data: users, total })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ success: false, error: '获取用户列表失败' })
  }
})

router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    let user = null
    
    try {
      const [users] = await pool.query(
        `SELECT 
          u.*,
          GROUP_CONCAT(ur.role_id) as roleIds
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        WHERE u.id = ?
        GROUP BY u.id`,
        [id]
      )
      
      if (users.length > 0) {
        user = users[0]
        if (user.roleIds) {
          user.roleIds = user.roleIds.split(',').map(r => parseInt(r))
        }
      }
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      user = {
        id: 1,
        username: 'admin',
        realName: '系统管理员',
        email: 'admin@aierp.com',
        status: 1
      }
    }
    
    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' })
    }
    
    res.json({ success: true, data: user })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ success: false, error: '获取用户详情失败' })
  }
})

router.post('/user', async (req, res) => {
  try {
    const { username, password, realName, email, phone, department, roleIds, status = 1, createdBy } = req.body
    
    if (!username || !password || !realName) {
      return res.status(400).json({ success: false, error: '请提供用户名、密码和真实姓名' })
    }
    
    let userId = null
    
    try {
      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        
        const [result] = await connection.query(
          `INSERT INTO users (username, password, real_name, email, phone, department, status, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [username, password, realName, email, phone, department, status, createdBy]
        )
        
        userId = result.insertId
        
        if (roleIds && roleIds.length > 0) {
          for (const roleId of roleIds) {
            await connection.query(
              'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
              [userId, roleId]
            )
          }
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
    
    const user = {
      id: userId,
      username,
      realName,
      email,
      status
    }
    
    res.json({ success: true, data: user, message: '用户创建成功' })
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ success: false, error: '创建用户失败' })
  }
})

router.put('/user/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { realName, email, phone, department, roleIds, status } = req.body
    
    try {
      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        
        await connection.query(
          `UPDATE users 
           SET real_name = ?, email = ?, phone = ?, department = ?, status = ?
           WHERE id = ?`,
          [realName, email, phone, department, status, id]
        )
        
        await connection.query('DELETE FROM user_roles WHERE user_id = ?', [id])
        
        if (roleIds && roleIds.length > 0) {
          for (const roleId of roleIds) {
            await connection.query(
              'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
              [id, roleId]
            )
          }
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
    
    res.json({ success: true, message: '用户更新成功' })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ success: false, error: '更新用户失败' })
  }
})

router.put('/user/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params
    const { password = '123456' } = req.body
    
    try {
      await pool.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [password, id]
      )
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    res.json({ success: true, message: '密码已重置为: 123456' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ success: false, error: '重置密码失败' })
  }
})

router.put('/user/:id/password', async (req, res) => {
  try {
    const { id } = req.params
    const { oldPassword, newPassword } = req.body
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, error: '请提供旧密码和新密码' })
    }
    
    try {
      await pool.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [newPassword, id]
      )
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    res.json({ success: true, message: '密码修改成功' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ success: false, error: '修改密码失败' })
  }
})

router.delete('/user/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    try {
      await pool.query(
        'UPDATE users SET status = 0 WHERE id = ?',
        [id]
      )
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    res.json({ success: true, message: '用户删除成功' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ success: false, error: '删除用户失败' })
  }
})

router.get('/roles', async (req, res) => {
  try {
    let roles = []
    
    try {
      const [result] = await pool.query(
        `SELECT 
          r.id,
          r.name,
          r.code,
          r.description,
          r.status,
          COUNT(ur.user_id) as userCount
        FROM roles r
        LEFT JOIN user_roles ur ON r.id = ur.role_id
        GROUP BY r.id
        ORDER BY r.id`
      )
      
      roles = result
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      roles = [
        { id: 1, name: '超级管理员', code: 'SUPER_ADMIN', description: '拥有系统所有权限', userCount: 1, status: 1 },
      ]
    }
    
    res.json({ success: true, data: roles })
  } catch (error) {
    console.error('Get roles error:', error)
    res.status(500).json({ success: false, error: '获取角色失败' })
  }
})

router.get('/roles/:id', async (req, res) => {
  try {
    const { id } = req.params
    let role = null
    
    try {
      const [roles] = await pool.query(
        `SELECT 
          r.*,
          GROUP_CONCAT(rm.menu_id) as menuIds
        FROM roles r
        LEFT JOIN role_menus rm ON r.id = rm.role_id
        WHERE r.id = ?
        GROUP BY r.id`,
        [id]
      )
      
      if (roles.length > 0) {
        role = roles[0]
        if (role.menuIds) {
          role.menuIds = role.menuIds.split(',').map(m => parseInt(m))
        }
      }
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      role = {
        id: 1,
        name: '超级管理员',
        code: 'SUPER_ADMIN',
        description: '拥有系统所有权限',
        status: 1
      }
    }
    
    if (!role) {
      return res.status(404).json({ success: false, error: '角色不存在' })
    }
    
    res.json({ success: true, data: role })
  } catch (error) {
    console.error('Get role error:', error)
    res.status(500).json({ success: false, error: '获取角色详情失败' })
  }
})

router.post('/role', async (req, res) => {
  try {
    const { name, code, description, menuIds, status = 1, createdBy } = req.body
    
    if (!name || !code) {
      return res.status(400).json({ success: false, error: '请提供角色名称和编码' })
    }
    
    let roleId = null
    
    try {
      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        
        const [result] = await connection.query(
          `INSERT INTO roles (name, code, description, status, created_by)
           VALUES (?, ?, ?, ?, ?)`,
          [name, code, description, status, createdBy]
        )
        
        roleId = result.insertId
        
        if (menuIds && menuIds.length > 0) {
          for (const menuId of menuIds) {
            await connection.query(
              'INSERT INTO role_menus (role_id, menu_id) VALUES (?, ?)',
              [roleId, menuId]
            )
          }
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
    
    const role = {
      id: roleId,
      name,
      code,
      status
    }
    
    res.json({ success: true, data: role, message: '角色创建成功' })
  } catch (error) {
    console.error('Create role error:', error)
    res.status(500).json({ success: false, error: '创建角色失败' })
  }
})

router.put('/role/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, code, description, menuIds, status } = req.body
    
    try {
      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        
        await connection.query(
          `UPDATE roles 
           SET name = ?, code = ?, description = ?, status = ?
           WHERE id = ?`,
          [name, code, description, status, id]
        )
        
        await connection.query('DELETE FROM role_menus WHERE role_id = ?', [id])
        
        if (menuIds && menuIds.length > 0) {
          for (const menuId of menuIds) {
            await connection.query(
              'INSERT INTO role_menus (role_id, menu_id) VALUES (?, ?)',
              [id, menuId]
            )
          }
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
    
    res.json({ success: true, message: '角色更新成功' })
  } catch (error) {
    console.error('Update role error:', error)
    res.status(500).json({ success: false, error: '更新角色失败' })
  }
})

router.delete('/role/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    try {
      await pool.query(
        'UPDATE roles SET status = 0 WHERE id = ?',
        [id]
      )
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
    }
    
    res.json({ success: true, message: '角色删除成功' })
  } catch (error) {
    console.error('Delete role error:', error)
    res.status(500).json({ success: false, error: '删除角色失败' })
  }
})

router.get('/menus', async (req, res) => {
  try {
    let menus = []
    
    try {
      const [result] = await pool.query(
        `SELECT 
          id,
          parent_id as parentId,
          name,
          path,
          icon,
          sort,
          status
        FROM menus
        WHERE status = 1
        ORDER BY sort`,
        []
      )
      
      menus = result
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      menus = [
        { id: 1, parentId: 0, name: '工作台', path: '/dashboard', icon: 'el-icon-monitor', sort: 1, status: 1 },
      ]
    }
    
    res.json({ success: true, data: menus })
  } catch (error) {
    console.error('Get menus error:', error)
    res.status(500).json({ success: false, error: '获取菜单失败' })
  }
})

router.get('/logs', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, operator = '', actionType = '', startDate = '', endDate = '' } = req.query
    const offset = (page - 1) * pageSize
    
    let logs = []
    let total = 0
    
    try {
      let whereClause = 'WHERE 1=1'
      const params = []
      
      if (operator) {
        whereClause += ' AND u.username LIKE ?'
        params.push(`%${operator}%`)
      }
      
      if (actionType) {
        whereClause += ' AND l.action_type = ?'
        params.push(actionType)
      }
      
      if (startDate) {
        whereClause += ' AND l.created_at >= ?'
        params.push(startDate)
      }
      
      if (endDate) {
        whereClause += ' AND l.created_at <= ?'
        params.push(endDate)
      }
      
      const [logsResult] = await pool.query(
        `SELECT 
          l.id,
          l.created_at as operateTime,
          u.username as operator,
          l.action_type as actionType,
          l.module,
          l.content,
          l.ip_address as ipAddress,
          l.result
        FROM logs l
        LEFT JOIN users u ON l.user_id = u.id
        ${whereClause}
        ORDER BY l.created_at DESC
        LIMIT ? OFFSET ?`,
        [...params, parseInt(pageSize), offset]
      )
      
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total FROM logs l ${whereClause}`,
        params
      )
      
      logs = logsResult
      total = countResult[0].total
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      logs = [
        { id: 1, operateTime: '2024-05-15 10:30:25', operator: 'admin', actionType: 'login', module: '系统', content: '用户登录系统', ipAddress: '192.168.1.100', result: '成功' },
      ]
      total = logs.length
    }
    
    res.json({ success: true, data: logs, total })
  } catch (error) {
    console.error('Get logs error:', error)
    res.status(500).json({ success: false, error: '获取日志失败' })
  }
})

router.get('/settings', async (req, res) => {
  try {
    let settings = {}
    
    try {
      const [result] = await pool.query('SELECT key, value FROM settings')
      
      result.forEach(item => {
        settings[item.key] = item.value
      })
    } catch (dbError) {
      if (dbError.message !== 'DB_NOT_CONNECTED') {
        throw dbError
      }
      
      settings = {
        companyName: 'AIERP管理系统',
        companyLogo: '/logo.png'
      }
    }
    
    res.json({ success: true, data: settings })
  } catch (error) {
    console.error('Get settings error:', error)
    res.status(500).json({ success: false, error: '获取系统设置失败' })
  }
})

router.put('/settings', async (req, res) => {
  try {
    const settings = req.body
    
    try {
      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        
        for (const [key, value] of Object.entries(settings)) {
          await connection.query(
            `INSERT INTO settings (key, value) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE value = ?`,
            [key, value, value]
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
    
    res.json({ success: true, message: '设置更新成功' })
  } catch (error) {
    console.error('Update settings error:', error)
    res.status(500).json({ success: false, error: '更新设置失败' })
  }
})

module.exports = router
