const { pool } = require('../config/database');

const prefixMap = {
  retail: 'RT',
  purchase: 'PO',
  'purchase-in': 'PI',
  sales: 'SO',
  'sales-out': 'SX',
  receipt: 'RC',
  payment: 'PY'
};

const generateBillNo = async (type) => {
  const prefix = prefixMap[type];
  if (!prefix) {
    throw new Error('未知的单据类型');
  }

  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const sequenceKey = `bill_sequence_${type}_${dateStr}`;

  try {
    let sequence = 1;

    const [rows] = await pool.query(
      'SELECT sequence FROM bill_sequences WHERE bill_type = ? AND bill_date = ? FOR UPDATE',
      [type, dateStr]
    );

    if (rows.length > 0) {
      sequence = rows[0].sequence + 1;
      await pool.query(
        'UPDATE bill_sequences SET sequence = ? WHERE bill_type = ? AND bill_date = ?',
        [sequence, type, dateStr]
      );
    } else {
      await pool.query(
        'INSERT INTO bill_sequences (bill_type, bill_date, sequence) VALUES (?, ?, ?)',
        [type, dateStr, sequence]
      );
    }

    const sequenceStr = String(sequence).padStart(4, '0');
    return `${prefix}${dateStr}${sequenceStr}`;
  } catch (error) {
    if (error.message === 'DB_NOT_CONNECTED') {
      const randomSequence = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
      return `${prefix}${dateStr}${randomSequence}`;
    }
    throw error;
  }
};

const validateBillNo = (billNo) => {
  const pattern = /^[A-Z]{2}\d{8}$/;
  return pattern.test(billNo);
};

module.exports = {
  generateBillNo,
  validateBillNo
};
