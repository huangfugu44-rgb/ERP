const Customer = {
  tableName: 'customers',
  schema: {
    id: { type: 'number', primaryKey: true, autoIncrement: true },
    code: { type: 'string', unique: true, required: true },
    name: { type: 'string', required: true },
    type: { type: 'string', enum: ['individual', 'company'] },
    phone: { type: 'string' },
    contact: { type: 'string' },
    address: { type: 'string' },
    email: { type: 'string' },
    accountId: { type: 'number', foreignKey: 'accounts(id)' },
    creditLimit: { type: 'decimal', precision: 10, scale: 2 },
    status: { type: 'number', default: 1 },
    createdAt: { type: 'date', default: 'CURRENT_TIMESTAMP' },
    updatedAt: { type: 'date', default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
  }
};

module.exports = Customer;
