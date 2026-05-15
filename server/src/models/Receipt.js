const Receipt = {
  tableName: 'receipts',
  schema: {
    id: { type: 'number', primaryKey: true, autoIncrement: true },
    orderNo: { type: 'string', unique: true, required: true },
    customerId: { type: 'number', foreignKey: 'customers(id)' },
    accountId: { type: 'number', foreignKey: 'accounts(id)' },
    amount: { type: 'decimal', precision: 10, scale: 2, required: true },
    paymentMethod: { type: 'string', enum: ['cash', 'wechat', 'alipay', 'bank', 'other'] },
    relatedOrderType: { type: 'string', enum: ['sales', 'receivable'] },
    relatedOrderId: { type: 'number' },
    status: { type: 'string', enum: ['draft', 'completed', 'cancelled'] },
    receiptDate: { type: 'date' },
    remark: { type: 'string' },
    createdBy: { type: 'number', foreignKey: 'users(id)' },
    createdAt: { type: 'date', default: 'CURRENT_TIMESTAMP' },
    updatedAt: { type: 'date', default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
  }
};

module.exports = Receipt;
