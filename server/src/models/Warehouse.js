const Warehouse = {
  tableName: 'warehouses',
  schema: {
    id: { type: 'number', primaryKey: true, autoIncrement: true },
    code: { type: 'string', unique: true, required: true },
    name: { type: 'string', required: true },
    type: { type: 'string', enum: ['main', 'branch', 'virtual'] },
    address: { type: 'string' },
    manager: { type: 'string' },
    phone: { type: 'string' },
    capacity: { type: 'number' },
    status: { type: 'number', default: 1 },
    createdAt: { type: 'date', default: 'CURRENT_TIMESTAMP' },
    updatedAt: { type: 'date', default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
  }
};

module.exports = Warehouse;
