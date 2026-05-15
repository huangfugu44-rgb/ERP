const SalesOut = {
  tableName: 'sales_out',
  schema: {
    id: { type: 'number', primaryKey: true, autoIncrement: true },
    orderNo: { type: 'string', unique: true, required: true },
    salesOrderId: { type: 'number', foreignKey: 'sales_orders(id)' },
    customerId: { type: 'number', foreignKey: 'customers(id)' },
    warehouseId: { type: 'number', foreignKey: 'warehouses(id)' },
    accountId: { type: 'number', foreignKey: 'accounts(id)' },
    totalAmount: { type: 'decimal', precision: 10, scale: 2 },
    paidAmount: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    status: { type: 'string', enum: ['draft', 'completed', 'cancelled'] },
    outDate: { type: 'date' },
    remark: { type: 'string' },
    createdBy: { type: 'number', foreignKey: 'users(id)' },
    createdAt: { type: 'date', default: 'CURRENT_TIMESTAMP' },
    updatedAt: { type: 'date', default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
  }
};

module.exports = SalesOut;
