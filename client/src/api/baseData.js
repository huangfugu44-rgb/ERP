import request from '@/utils/request';

export const getSuppliers = (params) => {
  return request({
    url: '/basedata/suppliers',
    method: 'get',
    params,
  });
};

export const getSupplierDetail = (id) => {
  return request({
    url: `/basedata/suppliers/${id}`,
    method: 'get',
  });
};

export const createSupplier = (data) => {
  return request({
    url: '/basedata/suppliers',
    method: 'post',
    data,
  });
};

export const updateSupplier = (id, data) => {
  return request({
    url: `/basedata/suppliers/${id}`,
    method: 'put',
    data,
  });
};

export const deleteSupplier = (id) => {
  return request({
    url: `/basedata/suppliers/${id}`,
    method: 'delete',
  });
};

export const getCustomers = (params) => {
  return request({
    url: '/basedata/customers',
    method: 'get',
    params,
  });
};

export const getCustomerDetail = (id) => {
  return request({
    url: `/basedata/customers/${id}`,
    method: 'get',
  });
};

export const createCustomer = (data) => {
  return request({
    url: '/basedata/customers',
    method: 'post',
    data,
  });
};

export const updateCustomer = (id, data) => {
  return request({
    url: `/basedata/customers/${id}`,
    method: 'put',
    data,
  });
};

export const deleteCustomer = (id) => {
  return request({
    url: `/basedata/customers/${id}`,
    method: 'delete',
  });
};

export const getWarehouses = (params) => {
  return request({
    url: '/basedata/warehouses',
    method: 'get',
    params,
  });
};

export const createWarehouse = (data) => {
  return request({
    url: '/basedata/warehouses',
    method: 'post',
    data,
  });
};

export const updateWarehouse = (id, data) => {
  return request({
    url: `/basedata/warehouses/${id}`,
    method: 'put',
    data,
  });
};

export const deleteWarehouse = (id) => {
  return request({
    url: `/basedata/warehouses/${id}`,
    method: 'delete',
  });
};

export const getAccounts = (params) => {
  return request({
    url: '/basedata/accounts',
    method: 'get',
    params,
  });
};

export const createAccount = (data) => {
  return request({
    url: '/basedata/accounts',
    method: 'post',
    data,
  });
};

export const updateAccount = (id, data) => {
  return request({
    url: `/basedata/accounts/${id}`,
    method: 'put',
    data,
  });
};

export const deleteAccount = (id) => {
  return request({
    url: `/basedata/accounts/${id}`,
    method: 'delete',
  });
};
