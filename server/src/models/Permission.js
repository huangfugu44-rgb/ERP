const Permission = {
  tableName: 'permissions',
  schema: {
    id: { type: 'number', primaryKey: true, autoIncrement: true },
    name: { type: 'string', required: true },
    code: { type: 'string', unique: true, required: true },
    type: { type: 'string', enum: ['menu', 'button', 'api'] },
    path: { type: 'string' },
    parentId: { type: 'number' },
    sort: { type: 'number', default: 0 },
    status: { type: 'number', default: 1 },
    createdAt: { type: 'date', default: 'CURRENT_TIMESTAMP' }
  }
};

module.exports = Permission;
