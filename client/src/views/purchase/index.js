export { default as PurchaseIndex } from './index.vue';
export { default as PurchaseOrder } from './order.vue';
export { default as PurchaseInbound } from './inbound.vue';
export { default as PurchaseReturn } from './return.vue';

export default {
  PurchaseIndex: () => import('./index.vue'),
  PurchaseOrder: () => import('./order.vue'),
  PurchaseInbound: () => import('./inbound.vue'),
  PurchaseReturn: () => import('./return.vue'),
};
