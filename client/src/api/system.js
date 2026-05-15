import request from '@/utils/request';

export const getUsers = (params) => {
  return request({
    url: '/system/users',
    method: 'get',
    params,
  });
};

export const getUserDetail = (id) => {
  return request({
    url: `/system/users/${id}`,
    method: 'get',
  });
};

export const createUser = (data) => {
  return request({
    url: '/system/users',
    method: 'post',
    data,
  });
};

export const updateUser = (id, data) => {
  return request({
    url: `/system/users/${id}`,
    method: 'put',
    data,
  });
};

export const deleteUser = (id) => {
  return request({
    url: `/system/users/${id}`,
    method: 'delete',
  });
};

export const getRoles = (params) => {
  return request({
    url: '/system/roles',
    method: 'get',
    params,
  });
};

export const getRoleDetail = (id) => {
  return request({
    url: `/system/roles/${id}`,
    method: 'get',
  });
};

export const createRole = (data) => {
  return request({
    url: '/system/roles',
    method: 'post',
    data,
  });
};

export const updateRole = (id, data) => {
  return request({
    url: `/system/roles/${id}`,
    method: 'put',
    data,
  });
};

export const deleteRole = (id) => {
  return request({
    url: `/system/roles/${id}`,
    method: 'delete',
  });
};

export const getLogs = (params) => {
  return request({
    url: '/system/logs',
    method: 'get',
    params,
  });
};

export const getSystemConfig = () => {
  return request({
    url: '/system/config',
    method: 'get',
  });
};

export const updateSystemConfig = (data) => {
  return request({
    url: '/system/config',
    method: 'put',
    data,
  });
};
