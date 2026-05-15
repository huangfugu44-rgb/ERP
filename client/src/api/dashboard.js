import request from '@/utils/request';

export const getDashboardStats = () => {
  return request({
    url: '/dashboard/stats',
    method: 'get',
  });
};

export const getSalesTrend = (params) => {
  return request({
    url: '/dashboard/sales-trend',
    method: 'get',
    params,
  });
};

export const getCategorySales = () => {
  return request({
    url: '/dashboard/category-sales',
    method: 'get',
  });
};

export const getRecentOrders = (params) => {
  return request({
    url: '/dashboard/recent-orders',
    method: 'get',
    params,
  });
};

export const getTodos = () => {
  return request({
    url: '/dashboard/todos',
    method: 'get',
  });
};

export const updateTodo = (id, data) => {
  return request({
    url: `/dashboard/todos/${id}`,
    method: 'put',
    data,
  });
};
