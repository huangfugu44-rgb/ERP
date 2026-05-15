const Account = {
  tableName: 'accounts',
  schema: {
    id: { type: 'number', primaryKey: true, autoIncrement: true },
    code: { type: 'string', unique: true, required: true },
    name: { type: 'string', required: true },
    type: { type: 'string', enum: ['cash', 'bank', 'wechat', 'alipay', 'other'] },
    bankName: { type: 'string' },
    bankAccount: { type: 'string' },
    initialBalance: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    currentBalance: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    status: { type: 'number', default: 1 },
    createdAt: { type: 'date', default: 'CURRENT_TIMESTAMP' },
    updatedAt: { type: 'date', default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
  }
};

module.exports = Account;
