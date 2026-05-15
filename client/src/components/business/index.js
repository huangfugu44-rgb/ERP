export { default as StatCard } from './StatCard.vue';
export { default as Chart } from './Chart.vue';
export { default as Modal } from './Modal.vue';
export { default as Message } from './Message.vue';

export default {
  StatCard: () => import('./StatCard.vue'),
  Chart: () => import('./Chart.vue'),
  Modal: () => import('./Modal.vue'),
  Message: () => import('./Message.vue'),
};
