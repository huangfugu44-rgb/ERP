import request from '@/utils/request';

export const getPurchaseOrders = (params) => {
  return request({
    url: '/purchase/orders',
    method: 'get',
    params,
  });
};

export const getPurchaseOrderDetail = (id) => {
  return request({
    url: `/purchase/orders/${id}`,
    method: 'get',
  });
};

export const createPurchaseOrder = (data) => {
  return request({
    url: '/purchase/orders',
    method: 'post',
    data,
  });
};

export const updatePurchaseOrder = (id, data) => {
  return request({
    url: `/purchase/orders/${id}`,
    method: 'put',
    data,
  });
};

export const deletePurchaseOrder = (id) => {
  return request({
    url: `/purchase/orders/${id}`,
    method: 'delete',
  });
};

export const getInboundOrders = (params) => {
  return request({
    url: '/purchase/inbound',
    method: 'get',
    params,
  });
};

export const createInboundOrder = (data) => {
  return request({
    url: '/purchase/inbound',
    method: 'post',
    data,
  });
};

export const getPurchaseReturns = (params) => {
  return request({
    url: '/purchase/returns',
    method: 'get',
    params,
  });
};

export const createPurchaseReturn = (data) => {
  return request({
    url: '/purchase/returns',
    method: 'post',
    data,
  });
};
