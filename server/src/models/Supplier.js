const Supplier = {
  tableName: 'suppliers',
  schema: {
    id: { type: 'number', primaryKey: true, autoIncrement: true },
    code: { type: 'string', unique: true, required: true },
    name: { type: 'string', required: true },
    type: { type: 'string', enum: ['manufacturer', 'distributor', 'agent'] },
    phone: { type: 'string' },
    contact: { type: 'string' },
    address: { type: 'string' },
    email: { type: 'string' },
    accountId: { type: 'number', foreignKey: 'accounts(id)' },
    status: { type: 'number', default: 1 },
    createdAt: { type: 'date', default: 'CURRENT_TIMESTAMP' },
    updatedAt: { type: 'date', default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
  }
};

module.exports = Supplier;
