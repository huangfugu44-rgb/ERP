import request from '@/utils/request';

export const getProductList = (params) => {
  return request({
    url: '/product/list',
    method: 'get',
    params,
  });
};

export const getProductDetail = (id) => {
  return request({
    url: `/product/${id}`,
    method: 'get',
  });
};

export const createProduct = (data) => {
  return request({
    url: '/product',
    method: 'post',
    data,
  });
};

export const updateProduct = (id, data) => {
  return request({
    url: `/product/${id}`,
    method: 'put',
    data,
  });
};

export const deleteProduct = (id) => {
  return request({
    url: `/product/${id}`,
    method: 'delete',
  });
};

export const getProductCategories = (params) => {
  return request({
    url: '/product/categories',
    method: 'get',
    params,
  });
};

export const createProductCategory = (data) => {
  return request({
    url: '/product/categories',
    method: 'post',
    data,
  });
};

export const updateProductCategory = (id, data) => {
  return request({
    url: `/product/categories/${id}`,
    method: 'put',
    data,
  });
};

export const deleteProductCategory = (id) => {
  return request({
    url: `/product/categories/${id}`,
    method: 'delete',
  });
};
