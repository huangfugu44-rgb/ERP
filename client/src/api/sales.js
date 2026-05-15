import request from '@/utils/request';

export const getSalesOrders = (params) => {
  return request({
    url: '/sales/orders',
    method: 'get',
    params,
  });
};

export const getSalesOrderDetail = (id) => {
  return request({
    url: `/sales/orders/${id}`,
    method: 'get',
  });
};

export const createSalesOrder = (data) => {
  return request({
    url: '/sales/orders',
    method: 'post',
    data,
  });
};

export const updateSalesOrder = (id, data) => {
  return request({
    url: `/sales/orders/${id}`,
    method: 'put',
    data,
  });
};

export const deleteSalesOrder = (id) => {
  return request({
    url: `/sales/orders/${id}`,
    method: 'delete',
  });
};

export const getOutboundOrders = (params) => {
  return request({
    url: '/sales/outbound',
    method: 'get',
    params,
  });
};

export const createOutboundOrder = (data) => {
  return request({
    url: '/sales/outbound',
    method: 'post',
    data,
  });
};

export const getSalesReturns = (params) => {
  return request({
    url: '/sales/returns',
    method: 'get',
    params,
  });
};

export const createSalesReturn = (data) => {
  return request({
    url: '/sales/returns',
    method: 'post',
    data,
  });
};
