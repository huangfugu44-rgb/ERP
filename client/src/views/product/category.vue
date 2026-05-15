<template>
  <div class="product-category-page">
    <el-card>
      <div slot="header">
        <span>商品分类</span>
        <el-button type="primary" size="small" style="float: right">新增分类</el-button>
      </div>
      <data-table :data="categoryList" :loading="loading">
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="code" label="分类编码" width="120"></el-table-column>
        <el-table-column prop="name" label="分类名称" width="180"></el-table-column>
        <el-table-column prop="parentName" label="上级分类" width="150"></el-table-column>
        <el-table-column prop="level" label="层级" width="80"></el-table-column>
        <el-table-column prop="sort" label="排序" width="80"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 1" type="success" size="small">启用</el-tag>
            <el-tag v-else type="info" size="small">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button link size="small">编辑</el-button>
            <el-button link size="small">删除</el-button>
          </template>
        </el-table-column>
      </data-table>
    </el-card>
  </div>
</template>

<script>
import { DataTable } from '@/components/common';
import { getProductCategories } from '@/api/product';

export default {
  name: 'ProductCategory',
  components: {
    DataTable,
  },
  data() {
    return {
      loading: false,
      categoryList: [],
    };
  },
  mounted() {
    this.loadCategories();
  },
  methods: {
    async loadCategories() {
      this.loading = true;
      try {
        const res = await getProductCategories({});
        this.categoryList = res.data.list || [];
      } catch (error) {
        console.error('加载分类失败:', error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.product-category-page {
  padding: 20px;
}
</style>
