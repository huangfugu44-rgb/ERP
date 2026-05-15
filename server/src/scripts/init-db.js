const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')

const initDatabase = async () => {
  try {
    console.log('开始初始化数据库...')
    
    // 第一步：创建连接（不带数据库名）
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      multipleStatements: true
    })

    console.log('连接 MySQL 成功')

    // 第二步：创建数据库
    await connection.execute('CREATE DATABASE IF NOT EXISTS aierp DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci')
    console.log('数据库 aierp 创建成功')

    // 第三步：使用数据库
    await connection.execute('USE aierp')

    // 第四步：创建数据表
    const tables = `
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        role ENUM('admin', 'manager', 'finance', 'sales', 'purchase', 'hr') DEFAULT 'manager',
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        contact VARCHAR(50),
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        total_amount DECIMAL(15,2) DEFAULT 0,
        order_count INT DEFAULT 0,
        status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS suppliers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        contact VARCHAR(50),
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        category VARCHAR(50),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50) UNIQUE,
        category VARCHAR(50),
        unit VARCHAR(20),
        price DECIMAL(10,2),
        cost DECIMAL(10,2),
        stock INT DEFAULT 0,
        min_stock INT DEFAULT 10,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_no VARCHAR(50) UNIQUE NOT NULL,
        customer_id INT,
        supplier_id INT,
        type ENUM('sale', 'purchase') NOT NULL,
        total_amount DECIMAL(15,2),
        notes TEXT,
        status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
        order_date DATE,
        delivery_date DATE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT,
        price DECIMAL(10,2),
        amount DECIMAL(15,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS inventory_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        type ENUM('in', 'out', 'adjust') NOT NULL,
        quantity INT,
        before_stock INT,
        after_stock INT,
        reason VARCHAR(200),
        operator_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS finances (
        id INT PRIMARY KEY AUTO_INCREMENT,
        type ENUM('income', 'expense') NOT NULL,
        category VARCHAR(50),
        amount DECIMAL(15,2),
        description TEXT,
        related_order_id INT,
        payment_status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
        transaction_date DATE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS employees (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        employee_no VARCHAR(50) UNIQUE,
        department VARCHAR(50),
        position VARCHAR(50),
        phone VARCHAR(20),
        email VARCHAR(100),
        salary DECIMAL(10,2),
        hire_date DATE,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS activities (
        id INT PRIMARY KEY AUTO_INCREMENT,
        type VARCHAR(50),
        content TEXT,
        entity_type VARCHAR(50),
        entity_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
    
    await connection.execute(tables)
    console.log('数据表创建成功')

    // 第五步：插入初始数据
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    await connection.execute(`INSERT IGNORE INTO users (username, password, email, role) VALUES 
      (?, ?, ?, 'admin'),
      (?, ?, ?, 'manager'),
      (?, ?, ?, 'finance'),
      (?, ?, ?, 'sales'),
      (?, ?, ?, 'purchase'),
      (?, ?, ?, 'hr')`,
      ['admin', hashedPassword, 'admin@aierp.com',
       'manager', hashedPassword, 'manager@aierp.com',
       'finance', hashedPassword, 'finance@aierp.com',
       'sales', hashedPassword, 'sales@aierp.com',
       'purchase', hashedPassword, 'purchase@aierp.com',
       'hr', hashedPassword, 'hr@aierp.com'])
    console.log('用户数据插入成功')

    await connection.execute(`INSERT IGNORE INTO customers (name, contact, phone, email, address, total_amount, order_count, status) VALUES 
      ('华为技术有限公司', '张经理', '138-0013-8000', 'huawei@example.com', '深圳市龙岗区', 2856000, 128, 'active'),
      ('阿里巴巴集团', '李总监', '139-0013-9000', 'alibaba@example.com', '杭州市余杭区', 1923500, 86, 'active'),
      ('腾讯科技', '王总', '137-0013-7000', 'tencent@example.com', '深圳市南山区', 3456800, 156, 'active'),
      ('字节跳动', '赵经理', '136-0013-6000', 'bytedance@example.com', '北京市海淀区', 856200, 42, 'pending'),
      ('京东集团', '陈总监', '135-0013-5000', 'jd@example.com', '北京市亦庄区', 1234600, 67, 'inactive'),
      ('小米科技', '刘经理', '134-0013-4000', 'xiaomi@example.com', '北京市海淀区', 756800, 53, 'active'),
      ('美团', '周总', '133-0013-3000', 'meituan@example.com', '北京市朝阳区', 456200, 34, 'active'),
      ('百度', '吴总监', '132-0013-2000', 'baidu@example.com', '北京市海淀区', 623500, 45, 'active')`)
    console.log('客户数据插入成功')

    await connection.execute(`INSERT IGNORE INTO suppliers (name, contact, phone, email, address, category, status) VALUES 
      ('联想集团', '孙经理', '158-0013-8001', 'lenovo@example.com', '北京市海淀区', '电脑设备', 'active'),
      ('英特尔', 'Larry', '158-0013-8002', 'intel@example.com', '美国加州', '芯片', 'active'),
      ('三星电子', 'Kim', '158-0013-8003', 'samsung@example.com', '韩国首尔', '显示屏', 'active'),
      ('高通', '沈经理', '158-0013-8004', 'qualcomm@example.com', '美国加州', '芯片', 'active'),
      ('戴尔科技', '周总监', '158-0013-8005', 'dell@example.com', '美国德州', '电脑设备', 'active')`)
    console.log('供应商数据插入成功')

    await connection.execute(`INSERT IGNORE INTO products (name, code, category, unit, price, cost, stock, min_stock, status) VALUES 
      ('iPhone 15 Pro', 'PRD-001', '手机', '台', 8999.00, 6500.00, 150, 50, 'active'),
      ('MacBook Pro 14', 'PRD-002', '笔记本电脑', '台', 15999.00, 12000.00, 80, 30, 'active'),
      ('iPad Pro 12.9', 'PRD-003', '平板电脑', '台', 9999.00, 7500.00, 120, 40, 'active'),
      ('AirPods Pro', 'PRD-004', '耳机', '副', 1899.00, 1200.00, 45, 100, 'active'),
      ('Apple Watch', 'PRD-005', '智能手表', '块', 2999.00, 2000.00, 200, 60, 'active'),
      ('Dell XPS 15', 'PRD-006', '笔记本电脑', '台', 12999.00, 9500.00, 60, 20, 'active'),
      ('ThinkPad X1', 'PRD-007', '笔记本电脑', '台', 11999.00, 8500.00, 75, 25, 'active'),
      ('Samsung 显示器', 'PRD-008', '显示器', '台', 3999.00, 2500.00, 180, 50, 'active')`)
    console.log('产品数据插入成功')

    // 插入销售订单
    const today = new Date()
    for (let i = 0; i < 15; i++) {
      const customerId = Math.floor(Math.random() * 5) + 1
      const totalAmount = Math.floor(Math.random() * 200000) + 50000
      const status = ['pending', 'processing', 'completed'][Math.floor(Math.random() * 3)]
      const orderDate = new Date(today - Math.random() * 30 * 24 * 60 * 60 * 1000)
      const orderNo = `SO-${Date.now()}-${i}`
      
      await connection.execute('INSERT INTO orders (order_no, customer_id, type, total_amount, status, order_date) VALUES (?, ?, ?, ?, ?, ?)',
        [orderNo, customerId, 'sale', totalAmount, status, orderDate.toISOString().split('T')[0]])
    }
    console.log('销售订单数据插入成功')

    // 插入采购订单
    for (let i = 0; i < 10; i++) {
      const supplierId = Math.floor(Math.random() * 5) + 1
      const totalAmount = Math.floor(Math.random() * 150000) + 30000
      const status = ['pending', 'processing', 'completed'][Math.floor(Math.random() * 3)]
      const orderDate = new Date(today - Math.random() * 30 * 24 * 60 * 60 * 1000)
      const orderNo = `PO-${Date.now()}-${i}`
      
      await connection.execute('INSERT INTO orders (order_no, supplier_id, type, total_amount, status, order_date) VALUES (?, ?, ?, ?, ?, ?)',
        [orderNo, supplierId, 'purchase', totalAmount, status, orderDate.toISOString().split('T')[0]])
    }
    console.log('采购订单数据插入成功')

    await connection.execute(`INSERT IGNORE INTO finances (type, category, amount, description, payment_status, transaction_date) VALUES 
      ('income', '销售收入', 2856000, '华为技术订单收款', 'paid', '2024-01-15'),
      ('income', '销售收入', 1280000, '腾讯科技订单收款', 'paid', '2024-01-14'),
      ('income', '销售收入', 568000, '字节跳动预付款', 'pending', '2024-01-20'),
      ('expense', '采购支出', 856000, '联想集团采购付款', 'paid', '2024-01-10'),
      ('expense', '运营成本', 125000, '办公室租金', 'paid', '2024-01-05'),
      ('expense', '员工薪酬', 450000, '1月员工工资', 'paid', '2024-01-25'),
      ('income', '服务收入', 156000, '技术服务费', 'paid', '2024-01-18'),
      ('expense', '营销费用', 89000, '广告投放', 'pending', '2024-01-22')`)
    console.log('财务数据插入成功')

    await connection.execute(`INSERT IGNORE INTO employees (name, employee_no, department, position, phone, email, salary, hire_date, status) VALUES 
      ('张三', 'EMP-001', '技术部', '技术总监', '180-0001-8001', 'zhangsan@aierp.com', 35000, '2020-03-15', 'active'),
      ('李四', 'EMP-002', '销售部', '销售经理', '180-0001-8002', 'lisi@aierp.com', 25000, '2021-05-20', 'active'),
      ('王五', 'EMP-003', '财务部', '财务主管', '180-0001-8003', 'wangwu@aierp.com', 28000, '2019-08-10', 'active'),
      ('赵六', 'EMP-004', '采购部', '采购经理', '180-0001-8004', 'zhaoliu@aierp.com', 22000, '2021-02-28', 'active'),
      ('孙七', 'EMP-005', '人力资源部', 'HR主管', '180-0001-8005', 'sunqi@aierp.com', 20000, '2020-11-15', 'active'),
      ('周八', 'EMP-006', '技术部', '高级工程师', '180-0001-8006', 'zhouba@aierp.com', 30000, '2022-01-10', 'active'),
      ('吴九', 'EMP-007', '销售部', '销售代表', '180-0001-8007', 'wujiu@aierp.com', 15000, '2023-03-20', 'active'),
      ('郑十', 'EMP-008', '市场部', '市场经理', '180-0001-8008', 'zhengshi@aierp.com', 23000, '2021-09-05', 'active')`)
    console.log('员工数据插入成功')

    await connection.execute(`INSERT IGNORE INTO activities (type, content, entity_type, entity_id) VALUES 
      ('order', '新订单创建 - 华为技术 ¥128,500', 'order', 1),
      ('inventory', '库存预警 - iPhone 15 库存不足', 'inventory', 1),
      ('finance', '付款到账 - 腾讯科技 ¥256,800', 'finance', 1),
      ('customer', '新客户注册 - 字节跳动', 'customer', 4)`)
    console.log('动态数据插入成功')

    await connection.end()

    console.log('\n✅ 数据库初始化完成！')
    console.log('默认管理员账号: admin / admin123')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error)
    process.exit(1)
  }
}

initDatabase()
