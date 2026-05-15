const { pool } = require('../config/database');
const { generateBillNo } = require('../utils/billNo');

class OrderService {
  async createOrder(orderType, orderData) {
    try {
      const orderNo = await generateBillNo(orderType);
      const {
        customerId,
        supplierId,
        warehouseId,
        accountId,
        items,
        totalAmount,
        discountAmount = 0,
        paymentMethod,
        expectedDate,
        remark,
        createdBy
      } = orderData;

      let tableName;
      switch (orderType) {
        case 'retail':
          tableName = 'retail_orders';
          break;
        case 'purchase':
          tableName = 'purchase_orders';
          break;
        case 'sales':
          tableName = 'sales_orders';
          break;
        default:
          throw new Error('未知的订单类型');
      }

      const [result] = await pool.query(
        `INSERT INTO ${tableName} (orderNo, customerId, supplierId, warehouseId, accountId, totalAmount, discountAmount, paymentMethod, expectedDate, remark, createdBy, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
        [orderNo, customerId, supplierId, warehouseId, accountId, totalAmount, discountAmount, paymentMethod, expectedDate, remark, createdBy]
      );

      if (items && items.length > 0) {
        const itemsTable = `${tableName}_items`;
        for (const item of items) {
          await pool.query(
            `INSERT INTO ${itemsTable} (orderId, productId, warehouseId, quantity, unitPrice, amount) VALUES (?, ?, ?, ?, ?, ?)`,
            [result.insertId, item.productId, warehouseId, item.quantity, item.unitPrice, item.amount]
          );
        }
      }

      return {
        id: result.insertId,
        orderNo
      };
    } catch (error) {
      throw error;
    }
  }

  async updateOrder(orderType, orderId, updateData) {
    try {
      let tableName;
      switch (orderType) {
        case 'retail':
          tableName = 'retail_orders';
          break;
        case 'purchase':
          tableName = 'purchase_orders';
          break;
        case 'sales':
          tableName = 'sales_orders';
          break;
        default:
          throw new Error('未知的订单类型');
      }

      const updates = [];
      const values = [];

      if (updateData.status) {
        updates.push('status = ?');
        values.push(updateData.status);
      }
      if (updateData.totalAmount !== undefined) {
        updates.push('totalAmount = ?');
        values.push(updateData.totalAmount);
      }
      if (updateData.paidAmount !== undefined) {
        updates.push('paidAmount = ?');
        values.push(updateData.paidAmount);
      }
      if (updateData.remark !== undefined) {
        updates.push('remark = ?');
        values.push(updateData.remark);
      }

      if (updates.length === 0) {
        throw new Error('没有需要更新的字段');
      }

      values.push(orderId);
      await pool.query(`UPDATE ${tableName} SET ${updates.join(', ')} WHERE id = ?`, values);

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  async getOrders(orderType, filters = {}) {
    try {
      let tableName;
      switch (orderType) {
        case 'retail':
          tableName = 'retail_orders';
          break;
        case 'purchase':
          tableName = 'purchase_orders';
          break;
        case 'sales':
          tableName = 'sales_orders';
          break;
        default:
          throw new Error('未知的订单类型');
      }

      const { page = 1, pageSize = 20, status, startDate, endDate, keyword } = filters;
      const offset = (page - 1) * pageSize;

      let whereClause = '1=1';
      const params = [];

      if (status) {
        whereClause += ' AND status = ?';
        params.push(status);
      }
      if (startDate) {
        whereClause += ' AND createdAt >= ?';
        params.push(startDate);
      }
      if (endDate) {
        whereClause += ' AND createdAt <= ?';
        params.push(endDate);
      }
      if (keyword) {
        whereClause += ' AND (orderNo LIKE ? OR remark LIKE ?)';
        params.push(`%${keyword}%`, `%${keyword}%`);
      }

      const [rows] = await pool.query(
        `SELECT * FROM ${tableName} WHERE ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
        [...params, parseInt(pageSize), offset]
      );

      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total FROM ${tableName} WHERE ${whereClause}`,
        params
      );

      return {
        data: rows,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total: countResult[0].total
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new OrderService();
