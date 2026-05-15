const RetailOrder = {
  tableName: 'retail_orders',
  schema: {
    id: { type: 'number', primaryKey: true, autoIncrement: true },
    orderNo: { type: 'string', unique: true, required: true },
    customerId: { type: 'number', foreignKey: 'customers(id)' },
    warehouseId: { type: 'number', foreignKey: 'warehouses(id)' },
    accountId: { type: 'number', foreignKey: 'accounts(id)' },
    totalAmount: { type: 'decimal', precision: 10, scale: 2 },
    discountAmount: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    paidAmount: { type: 'decimal', precision: 10, scale: 2 },
    paymentMethod: { type: 'string', enum: ['cash', 'wechat', 'alipay', 'card'] },
    status: { type: 'string', enum: ['pending', 'completed', 'cancelled'] },
    remark: { type: 'string' },
    createdBy: { type: 'number', foreignKey: 'users(id)' },
    createdAt: { type: 'date', default: 'CURRENT_TIMESTAMP' },
    updatedAt: { type: 'date', default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
  }
};

module.exports = RetailOrder;
