# AIERP 系统运行文档

## 目录
- [系统概述](#系统概述)
- [环境要求](#环境要求)
- [安装步骤](#安装步骤)
- [配置说明](#配置说明)
- [启动服务](#启动服务)
- [访问系统](#访问系统)
- [常见问题](#常见问题)

---

## 系统概述

AIERP 是一个基于 Vue 3 + Element Plus + Node.js + Express + MySQL 开发的企业资源管理系统，包含销售、采购、仓库、财务、零售等核心业务模块。

### 技术栈
- **前端**: Vue 3 + Element Plus + Vue Router + Pinia + ECharts
- **后端**: Node.js + Express + MySQL + Redis + JWT
- **构建工具**: Vite

---

## 环境要求

### 必需环境
| 软件 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | ≥ 18.x | JavaScript 运行环境 |
| npm | ≥ 9.x | 包管理器（随 Node.js 一起安装）|
| MySQL | ≥ 8.0 | 关系型数据库 |
| Redis | ≥ 6.0 | 缓存和会话存储 |

### 可选环境
- **Git**: 用于版本控制
- **VS Code**: 推荐的代码编辑器

---

## 安装步骤

### 1. 克隆或获取项目代码

将项目代码复制到本地目录，例如 `e:\AIERP项目`

### 2. 安装前端依赖

```bash
cd client
npm install
```

### 3. 安装后端依赖

```bash
cd ../server
npm install
```

---

## 配置说明

### 后端配置

后端配置文件位于 `server/src/config/` 目录下。

#### 数据库配置 (database.js)

创建 MySQL 数据库，然后修改数据库连接配置：

```javascript
// 可根据实际情况修改以下配置
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'your_password', // 修改为你的 MySQL 密码
  database: 'aierp_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};
```

#### Redis 配置

在 `server/src/config/database.js` 中配置 Redis 连接：

```javascript
const redisConfig = {
  host: 'localhost',
  port: 6379,
  password: '', // 如有密码请配置
  db: 0
};
```

#### CORS 配置 (cors.js)

根据实际需求修改允许的跨域来源：

```javascript
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
};
```

### 前端配置

前端 API 配置位于 `client/src/utils/axios.js`：

```javascript
// 修改 API 基础地址
const baseURL = 'http://localhost:3000/api';
```

---

## 启动服务

### 1. 初始化数据库

首次运行前需要初始化数据库：

```bash
cd server
npm run init-db
```

该脚本会：
- 创建数据库（如果不存在）
- 创建所有数据表
- 插入初始化数据（包括测试账号）

### 2. 启动后端服务

```bash
cd server
# 开发模式（支持热重载）
npm run dev

# 生产模式
npm run start
```

后端服务将在 **http://localhost:3000** 启动

### 3. 启动前端开发服务器

打开新的终端窗口：

```bash
cd client
npm run dev
```

前端开发服务器将在 **http://localhost:5173** 启动

### 4. 构建生产版本（可选）

如果需要部署到生产环境：

```bash
cd client
npm run build
```

构建产物将输出到 `client/dist/` 目录。

---

## 访问系统

### 登录系统

在浏览器中打开前端地址（如 http://localhost:5173），使用以下测试账号登录：

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 系统管理员 |

### 系统功能模块

登录成功后，可访问以下功能模块：

- **仪表盘**: 数据统计、图表展示、快捷操作
- **销售管理**: 销售订单、销售出库、销售退货
- **采购管理**: 采购订单、采购入库、采购退货
- **仓库管理**: 库存查询、库存调拨、库存预警
- **财务管理**: 收款单、付款单、财务报表
- **零售管理**: 零售收银、零售退货
- **产品管理**: 商品列表、商品分类
- **基础数据**: 客户管理、供应商管理、仓库管理、账户管理
- **系统管理**: 用户管理、角色权限、操作日志

---

## 常见问题

### Q1: npm install 速度慢

A: 可以使用国内镜像源：

```bash
npm config set registry https://registry.npmmirror.com
```

### Q2: 数据库连接失败

A: 检查以下几点：
1. MySQL 服务是否已启动
2. 数据库配置信息是否正确
3. 数据库用户是否有足够的权限

### Q3: 前端无法访问后端接口

A: 检查：
1. 后端服务是否正常启动
2. CORS 配置是否正确
3. API 基础地址配置是否正确

### Q4: Redis 连接失败

A: 检查：
1. Redis 服务是否已启动
2. Redis 配置信息是否正确
3. 防火墙设置是否允许连接

### Q5: 端口被占用

A: 修改端口配置：

**后端**: 在 `server/src/index.js` 中修改
```javascript
const PORT = process.env.PORT || 3000;
```

**前端**: 在 `client/vite.config.js` 中修改
```javascript
server: {
  port: 5173,
}
```

---

## 项目目录结构

```
AIERP项目/
├── server/              # 后端代码
│   ├── src/
│   │   ├── config/      # 配置文件
│   │   ├── middleware/  # 中间件
│   │   ├── models/      # 数据模型
│   │   ├── routes/      # 路由文件
│   │   ├── services/    # 业务逻辑
│   │   ├── utils/       # 工具函数
│   │   └── index.js     # 入口文件
│   └── package.json
├── client/            # 前端代码
│   ├── src/
│   │   ├── api/         # API 接口
│   │   ├── components/  # 组件
│   │   ├── router/      # 路由配置
│   │   ├── stores/      # 状态管理
│   │   ├── utils/       # 工具函数
│   │   ├── views/       # 页面视图
│   │   ├── App.vue      # 根组件
│   │   └── main.js      # 入口文件
│   ├── dist/            # 构建产物
│   └── package.json
└── docs/               # 文档
```

---

## 技术支持

如有问题，请查看项目文档或联系技术支持。
