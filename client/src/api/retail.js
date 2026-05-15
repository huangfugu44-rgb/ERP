import request from '@/utils/request';

export const getRetailOrders = (params) => {
  return request({
    url: '/retail/orders',
    method: 'get',
    params,
  });
};

export const getRetailOrderDetail = (id) => {
  return request({
    url: `/retail/order/${id}`,
    method: 'get',
  });
};

export const createRetailOrder = (data) => {
  return request({
    url: '/retail/order',
    method: 'post',
    data,
  });
};

export const refundRetailOrder = (data) => {
  return request({
    url: '/retail/order/refund',
    method: 'post',
    data,
  });
};

export const getRetailStats = () => {
  return request({
    url: '/retail/stats',
    method: 'get',
  });
};

export const getRetailProducts = (params) => {
  return request({
    url: '/retail/products',
    method: 'get',
    params,
  });
};

export const getRetailReturns = (params) => {
  return request({
    url: '/retail/returns',
    method: 'get',
    params,
  });
};

export const createRetailReturn = (data) => {
  return request({
    url: '/retail/returns',
    method: 'post',
    data,
  });
};
