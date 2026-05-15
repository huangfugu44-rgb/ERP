export { default as SalesIndex } from './index.vue';
export { default as SalesOrder } from './order.vue';
export { default as SalesOutbound } from './outbound.vue';
export { default as SalesReturn } from './return.vue';

export default {
  SalesIndex: () => import('./index.vue'),
  SalesOrder: () => import('./order.vue'),
  SalesOutbound: () => import('./outbound.vue'),
  SalesReturn: () => import('./return.vue'),
};
