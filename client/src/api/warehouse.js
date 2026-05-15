import request from '@/utils/request';

export const getWarehouseList = (params) => {
  return request({
    url: '/warehouse/list',
    method: 'get',
    params,
  });
};

export const getWarehouseDetail = (id) => {
  return request({
    url: `/warehouse/${id}`,
    method: 'get',
  });
};

export const createWarehouse = (data) => {
  return request({
    url: '/warehouse',
    method: 'post',
    data,
  });
};

export const updateWarehouse = (id, data) => {
  return request({
    url: `/warehouse/${id}`,
    method: 'put',
    data,
  });
};

export const deleteWarehouse = (id) => {
  return request({
    url: `/warehouse/${id}`,
    method: 'delete',
  });
};

export const getInventory = (params) => {
  return request({
    url: '/warehouse/inventory',
    method: 'get',
    params,
  });
};

export const getInventoryDetail = (id) => {
  return request({
    url: `/warehouse/inventory/${id}`,
    method: 'get',
  });
};

export const transferStock = (data) => {
  return request({
    url: '/warehouse/transfer',
    method: 'post',
    data,
  });
};

export const stockCheck = (data) => {
  return request({
    url: '/warehouse/stock-check',
    method: 'post',
    data,
  });
};
