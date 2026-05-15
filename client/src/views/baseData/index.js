export { default as BaseDataIndex } from './index.vue';
export { default as BaseDataSupplier } from './supplier.vue';
export { default as BaseDataCustomer } from './customer.vue';
export { default as BaseDataWarehouse } from './warehouse.vue';
export { default as BaseDataAccount } from './account.vue';

export default {
  BaseDataIndex: () => import('./index.vue'),
  BaseDataSupplier: () => import('./supplier.vue'),
  BaseDataCustomer: () => import('./customer.vue'),
  BaseDataWarehouse: () => import('./warehouse.vue'),
  BaseDataAccount: () => import('./account.vue'),
};
