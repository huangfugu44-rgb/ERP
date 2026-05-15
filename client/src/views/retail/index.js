export { default as RetailIndex } from './index.vue';
export { default as RetailOrder } from './order.vue';
export { default as RetailReturn } from './return.vue';

export default {
  RetailIndex: () => import('./index.vue'),
  RetailOrder: () => import('./order.vue'),
  RetailReturn: () => import('./return.vue'),
};
