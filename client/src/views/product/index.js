export { default as ProductIndex } from './index.vue';
export { default as ProductCategory } from './category.vue';

export default {
  ProductIndex: () => import('./index.vue'),
  ProductCategory: () => import('./category.vue'),
};
