export { default as SystemIndex } from './index.vue';
export { default as SystemUser } from './user.vue';
export { default as SystemRole } from './role.vue';
export { default as SystemLog } from './log.vue';

export default {
  SystemIndex: () => import('./index.vue'),
  SystemUser: () => import('./user.vue'),
  SystemRole: () => import('./role.vue'),
  SystemLog: () => import('./log.vue'),
};
