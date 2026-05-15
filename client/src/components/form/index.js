export { default as FormModal } from './FormModal.vue';
export { default as ProductSelect } from './ProductSelect.vue';

export default {
  FormModal: () => import('./FormModal.vue'),
  ProductSelect: () => import('./ProductSelect.vue'),
};
