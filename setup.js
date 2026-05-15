const { exec } = require('child_process')
const path = require('path')

console.log('🚀 AIERP 项目启动向导\n')

// 检查是否需要安装依赖
console.log('📦 正在检查后端依赖...')
const backendPath = path.join(__dirname, 'backend')
const frontendPath = path.join(__dirname, 'frontend')

// 1. 安装后端依赖
console.log('\n1/4 - 安装后端依赖...')
exec('npm install', { cwd: backendPath }, (err, stdout, stderr) => {
  if (err) {
    console.error('后端依赖安装失败:', stderr)
  } else {
    console.log('✅ 后端依赖安装完成')
  }

  // 2. 安装前端依赖
  console.log('\n2/4 - 安装前端依赖...')
  exec('npm install', { cwd: frontendPath }, (err, stdout, stderr) => {
    if (err) {
      console.error('前端依赖安装失败:', stderr)
    } else {
      console.log('✅ 前端依赖安装完成')
    }

    // 3. 初始化数据库
    console.log('\n3/4 - 初始化数据库...')
    console.log('⚠️ 请确保 MySQL 和 Redis 已启动！')
    console.log('   - MySQL: root / 123456')
    console.log('   - Redis: localhost:6379\n')
    
    exec('node src/scripts/init-db.js', { cwd: backendPath }, (err, stdout, stderr) => {
      if (err) {
        console.log('❌ 数据库初始化失败:', stderr)
        console.log('\n💡 提示: 如果数据库已存在，可以直接跳过这步')
      } else {
        console.log(stdout)
        console.log('✅ 数据库初始化完成')
      }

      console.log('\n4/4 - 启动服务...')
      console.log('\n📋 下一步，请在两个终端分别运行:')
      console.log('   终端1 (后端): cd backend && npm start')
      console.log('   终端2 (前端): cd frontend && npm run dev\n')
      
      console.log('🔑 默认登录账号:')
      console.log('   用户名: admin')
      console.log('   密码: admin123\n')
      
      console.log('🌐 访问地址:')
      console.log('   前端: http://localhost:3000')
      console.log('   后端: http://localhost:8080\n')
    })
  })
})
