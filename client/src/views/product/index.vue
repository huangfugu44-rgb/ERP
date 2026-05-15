<template>
  <div class="product-page">
    <el-card>
      <div slot="header">
        <span>商品管理</span>
        <el-button type="primary" size="small" style="float: right">新增商品</el-button>
      </div>
      <data-table
        :data="productList"
        :loading="loading"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handlePageChange"
      >
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="code" label="商品编码" width="120"></el-table-column>
        <el-table-column prop="name" label="商品名称" width="180"></el-table-column>
        <el-table-column prop="categoryName" label="商品分类" width="120"></el-table-column>
        <el-table-column prop="specification" label="规格" width="120"></el-table-column>
        <el-table-column prop="unit" label="单位" width="80"></el-table-column>
        <el-table-column prop="price" label="零售价" width="100"></el-table-column>
        <el-table-column prop="costPrice" label="成本价" width="100"></el-table-column>
        <el-table-column prop="stockQuantity" label="库存" width="100"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 1" type="success" size="small">启用</el-tag>
            <el-tag v-else type="info" size="small">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button link size="small">查看</el-button>
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
import { getProductList } from '@/api/product';

export default {
  name: 'ProductIndex',
  components: {
    DataTable,
  },
  data() {
    return {
      loading: false,
      productList: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
    };
  },
  mounted() {
    this.loadProducts();
  },
  methods: {
    async loadProducts() {
      this.loading = true;
      try {
        const res = await getProductList({
          page: this.currentPage,
          pageSize: this.pageSize,
        });
        this.productList = res.data.list || [];
        this.total = res.data.total || 0;
      } catch (error) {
        console.error('加载商品失败:', error);
      } finally {
        this.loading = false;
      }
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.loadProducts();
    },
  },
};
</script>

<style scoped>
.product-page {
  padding: 20px;
}
</style>
