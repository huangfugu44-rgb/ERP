const { pool } = require('../config/database');

class InventoryService {
  async getInventory(productId, warehouseId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM inventory WHERE productId = ? AND warehouseId = ?',
        [productId, warehouseId]
      );

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  async getInventoryList(filters = {}) {
    try {
      const { warehouseId, productId, category, lowStock } = filters;

      let whereClause = '1=1';
      const params = [];

      if (warehouseId) {
        whereClause += ' AND i.warehouseId = ?';
        params.push(warehouseId);
      }
      if (productId) {
        whereClause += ' AND i.productId = ?';
        params.push(productId);
      }
      if (lowStock) {
        whereClause += ' AND i.quantity <= p.minStock';
      }

      const [rows] = await pool.query(
        `SELECT i.*, p.name as productName, p.code as productCode, p.spec, p.unit, w.name as warehouseName
         FROM inventory i
         LEFT JOIN products p ON i.productId = p.id
         LEFT JOIN warehouses w ON i.warehouseId = w.id
         WHERE ${whereClause}`,
        params
      );

      return rows;
    } catch (error) {
      throw error;
    }
  }

  async adjustInventory(productId, warehouseId, quantity, type, reason, operatorId) {
    try {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        const [current] = await connection.query(
          'SELECT * FROM inventory WHERE productId = ? AND warehouseId = ? FOR UPDATE',
          [productId, warehouseId]
        );

        if (current.length === 0) {
          throw new Error('库存记录不存在');
        }

        const inventory = current[0];
        let newQuantity = inventory.quantity;

        if (type === 'in') {
          newQuantity += quantity;
        } else if (type === 'out') {
          newQuantity -= quantity;
          if (newQuantity < 0) {
            throw new Error('库存不足');
          }
        } else if (type === 'set') {
          newQuantity = quantity;
        }

        await connection.query(
          'UPDATE inventory SET quantity = ?, availableQuantity = ? WHERE productId = ? AND warehouseId = ?',
          [newQuantity, newQuantity, productId, warehouseId]
        );

        await connection.query(
          'INSERT INTO inventory_logs (productId, warehouseId, type, quantity, beforeQuantity, afterQuantity, reason, operatorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [productId, warehouseId, type, quantity, inventory.quantity, newQuantity, reason, operatorId]
        );

        await connection.commit();
        return { success: true, newQuantity };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      throw error;
    }
  }

  async transfer(fromWarehouseId, toWarehouseId, productId, quantity, operatorId) {
    try {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        const [fromInventory] = await connection.query(
          'SELECT * FROM inventory WHERE productId = ? AND warehouseId = ? FOR UPDATE',
          [productId, fromWarehouseId]
        );

        if (fromInventory.length === 0 || fromInventory[0].quantity < quantity) {
          throw new Error('库存不足或记录不存在');
        }

        const [toInventory] = await connection.query(
          'SELECT * FROM inventory WHERE productId = ? AND warehouseId = ? FOR UPDATE',
          [productId, toWarehouseId]
        );

        await connection.query(
          'UPDATE inventory SET quantity = quantity - ?, availableQuantity = availableQuantity - ? WHERE productId = ? AND warehouseId = ?',
          [quantity, quantity, productId, fromWarehouseId]
        );

        if (toInventory.length === 0) {
          await connection.query(
            'INSERT INTO inventory (productId, warehouseId, quantity, availableQuantity) VALUES (?, ?, ?, ?)',
            [productId, toWarehouseId, quantity, quantity]
          );
        } else {
          await connection.query(
            'UPDATE inventory SET quantity = quantity + ?, availableQuantity = availableQuantity + ? WHERE productId = ? AND warehouseId = ?',
            [quantity, quantity, productId, toWarehouseId]
          );
        }

        await connection.query(
          'INSERT INTO inventory_transfer (fromWarehouseId, toWarehouseId, productId, quantity, operatorId) VALUES (?, ?, ?, ?, ?)',
          [fromWarehouseId, toWarehouseId, productId, quantity, operatorId]
        );

        await connection.commit();
        return { success: true };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new InventoryService();
