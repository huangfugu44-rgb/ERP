import request from '@/utils/request';

export const getReceipts = (params) => {
  return request({
    url: '/finance/receipts',
    method: 'get',
    params,
  });
};

export const getReceiptDetail = (id) => {
  return request({
    url: `/finance/receipts/${id}`,
    method: 'get',
  });
};

export const createReceipt = (data) => {
  return request({
    url: '/finance/receipts',
    method: 'post',
    data,
  });
};

export const updateReceipt = (id, data) => {
  return request({
    url: `/finance/receipts/${id}`,
    method: 'put',
    data,
  });
};

export const deleteReceipt = (id) => {
  return request({
    url: `/finance/receipts/${id}`,
    method: 'delete',
  });
};

export const getPayments = (params) => {
  return request({
    url: '/finance/payments',
    method: 'get',
    params,
  });
};

export const getPaymentDetail = (id) => {
  return request({
    url: `/finance/payments/${id}`,
    method: 'get',
  });
};

export const createPayment = (data) => {
  return request({
    url: '/finance/payments',
    method: 'post',
    data,
  });
};

export const updatePayment = (id, data) => {
  return request({
    url: `/finance/payments/${id}`,
    method: 'put',
    data,
  });
};

export const deletePayment = (id) => {
  return request({
    url: `/finance/payments/${id}`,
    method: 'delete',
  });
};

export const getAccountBalance = (params) => {
  return request({
    url: '/finance/balance',
    method: 'get',
    params,
  });
};
