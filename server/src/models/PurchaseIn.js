const PurchaseIn = {
  tableName: 'purchase_in',
  schema: {
    id: { type: 'number', primaryKey: true, autoIncrement: true },
    orderNo: { type: 'string', unique: true, required: true },
    purchaseOrderId: { type: 'number', foreignKey: 'purchase_orders(id)' },
    supplierId: { type: 'number', foreignKey: 'suppliers(id)' },
    warehouseId: { type: 'number', foreignKey: 'warehouses(id)' },
    accountId: { type: 'number', foreignKey: 'accounts(id)' },
    totalAmount: { type: 'decimal', precision: 10, scale: 2 },
    paidAmount: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    status: { type: 'string', enum: ['draft', 'completed', 'cancelled'] },
    inDate: { type: 'date' },
    remark: { type: 'string' },
    createdBy: { type: 'number', foreignKey: 'users(id)' },
    createdAt: { type: 'date', default: 'CURRENT_TIMESTAMP' },
    updatedAt: { type: 'date', default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
  }
};

module.exports = PurchaseIn;
