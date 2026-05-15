const mysql = require('mysql2/promise')
const redis = require('redis')

let pool = null
let redisClient = null

try {
  pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'aierp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  })
  
  pool.query = (async (...args) => {
    try {
      const connection = await pool.getConnection()
      try {
        const result = await connection.query(...args)
        return result
      } finally {
        connection.release()
      }
    } catch (error) {
      console.error('Database query error, falling back to mock data:', error.message)
      throw new Error('DB_NOT_CONNECTED')
    }
  }).bind(pool)
} catch (error) {
  console.error('Failed to create MySQL pool:', error.message)
}

try {
  redisClient = redis.createClient({
    url: 'redis://localhost:6379'
  })
  redisClient.on('error', (err) => console.log('Redis Client Error', err))
} catch (error) {
  console.error('Failed to create Redis client:', error.message)
}

module.exports = { pool, redisClient }
