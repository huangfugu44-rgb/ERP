const User = {
  tableName: 'users',
  schema: {
    id: { type: 'number', primaryKey: true, autoIncrement: true },
    username: { type: 'string', unique: true, required: true },
    password: { type: 'string', required: true },
    realName: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    roleId: { type: 'number', foreignKey: 'roles(id)' },
    status: { type: 'number', default: 1 },
    createdAt: { type: 'date', default: 'CURRENT_TIMESTAMP' },
    updatedAt: { type: 'date', default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
  }
};

module.exports = User;
