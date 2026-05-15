const Product = {
  tableName: 'products',
  schema: {
    id: { type: 'number', primaryKey: true, autoIncrement: true },
    code: { type: 'string', unique: true, required: true },
    name: { type: 'string', required: true },
    category: { type: 'string' },
    spec: { type: 'string' },
    unit: { type: 'string' },
    costPrice: { type: 'decimal', precision: 10, scale: 2 },
    salePrice: { type: 'decimal', precision: 10, scale: 2 },
    retailPrice: { type: 'decimal', precision: 10, scale: 2 },
    minStock: { type: 'number', default: 0 },
    maxStock: { type: 'number', default: 0 },
    barcode: { type: 'string' },
    image: { type: 'string' },
    status: { type: 'number', default: 1 },
    createdAt: { type: 'date', default: 'CURRENT_TIMESTAMP' },
    updatedAt: { type: 'date', default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
  }
};

module.exports = Product;
