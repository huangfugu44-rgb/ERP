const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'aierp-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

class AuthService {
  async login(username, password) {
    try {
      const [users] = await pool.query(
        'SELECT * FROM users WHERE username = ? AND status = 1',
        [username]
      );

      if (users.length === 0) {
        throw new Error('用户名或密码错误');
      }

      const user = users[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new Error('用户名或密码错误');
      }

      const token = this.generateToken(user);

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          realName: user.realName,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    try {
      const { username, password, email, realName, roleId } = userData;

      const [existing] = await pool.query(
        'SELECT id FROM users WHERE username = ?',
        [username]
      );

      if (existing.length > 0) {
        throw new Error('用户名已存在');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await pool.query(
        'INSERT INTO users (username, password, email, realName, roleId) VALUES (?, ?, ?, ?, ?)',
        [username, hashedPassword, email, realName, roleId || 2]
      );

      const token = this.generateToken({ id: result.insertId, username, roleId });

      return {
        token,
        user: {
          id: result.insertId,
          username,
          email,
          realName,
          roleId
        }
      };
    } catch (error) {
      throw error;
    }
  }

  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role || user.roleId
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('无效或过期的令牌');
    }
  }

  async changePassword(userId, oldPassword, newPassword) {
    try {
      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

      if (users.length === 0) {
        throw new Error('用户不存在');
      }

      const user = users[0];
      const isValidPassword = await bcrypt.compare(oldPassword, user.password);

      if (!isValidPassword) {
        throw new Error('原密码错误');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

      return { success: true, message: '密码修改成功' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();
