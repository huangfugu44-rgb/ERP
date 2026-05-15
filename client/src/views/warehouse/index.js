export { default as WarehouseIndex } from './index.vue';
export { default as WarehouseInventory } from './inventory.vue';

export default {
  WarehouseIndex: () => import('./index.vue'),
  WarehouseInventory: () => import('./inventory.vue'),
};
