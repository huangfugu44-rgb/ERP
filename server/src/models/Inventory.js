const Inventory = {
  tableName: 'inventory',
  schema: {
    id: { type: 'number', primaryKey: true, autoIncrement: true },
    productId: { type: 'number', foreignKey: 'products(id)', required: true },
    warehouseId: { type: 'number', foreignKey: 'warehouses(id)', required: true },
    quantity: { type: 'number', default: 0 },
    availableQuantity: { type: 'number', default: 0 },
    frozenQuantity: { type: 'number', default: 0 },
    costPrice: { type: 'decimal', precision: 10, scale: 2 },
    lastInPrice: { type: 'decimal', precision: 10, scale: 2 },
    lastOutPrice: { type: 'decimal', precision: 10, scale: 2 },
    createdAt: { type: 'date', default: 'CURRENT_TIMESTAMP' },
    updatedAt: { type: 'date', default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
  }
};

module.exports = Inventory;
