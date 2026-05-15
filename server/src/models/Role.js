const Role = {
  tableName: 'roles',
  schema: {
    id: { type: 'number', primaryKey: true, autoIncrement: true },
    name: { type: 'string', unique: true, required: true },
    code: { type: 'string', unique: true, required: true },
    description: { type: 'string' },
    permissions: { type: 'json' },
    status: { type: 'number', default: 1 },
    createdAt: { type: 'date', default: 'CURRENT_TIMESTAMP' },
    updatedAt: { type: 'date', default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
  }
};

module.exports = Role;
