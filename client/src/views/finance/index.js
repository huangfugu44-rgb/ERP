export { default as FinanceIndex } from './index.vue';
export { default as FinanceReceipt } from './receipt.vue';
export { default as FinancePayment } from './payment.vue';

export default {
  FinanceIndex: () => import('./index.vue'),
  FinanceReceipt: () => import('./receipt.vue'),
  FinancePayment: () => import('./payment.vue'),
};
