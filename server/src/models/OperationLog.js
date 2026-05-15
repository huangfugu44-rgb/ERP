const OperationLog = {
  tableName: 'operation_logs',
  schema: {
    id: { type: 'number', primaryKey: true, autoIncrement: true },
    userId: { type: 'number', foreignKey: 'users(id)' },
    username: { type: 'string' },
    module: { type: 'string', required: true },
    action: { type: 'string', required: true },
    targetId: { type: 'number' },
    targetType: { type: 'string' },
    description: { type: 'string' },
    ipAddress: { type: 'string' },
    userAgent: { type: 'string' },
    requestMethod: { type: 'string' },
    requestUrl: { type: 'string' },
    requestParams: { type: 'json' },
    responseStatus: { type: 'number' },
    createdAt: { type: 'date', default: 'CURRENT_TIMESTAMP' }
  }
};

module.exports = OperationLog;
