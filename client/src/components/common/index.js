export { default as DataTable } from './DataTable.vue';
export { default as SearchForm } from './SearchForm.vue';
export { default as Pagination } from './Pagination.vue';
export { default as ExportButton } from './ExportButton.vue';

export default {
  DataTable: () => import('./DataTable.vue'),
  SearchForm: () => import('./SearchForm.vue'),
  Pagination: () => import('./Pagination.vue'),
  ExportButton: () => import('./ExportButton.vue'),
};
