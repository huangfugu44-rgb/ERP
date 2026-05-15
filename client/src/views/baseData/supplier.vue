<template>
  <div class="supplier-page">
    <el-card>
      <div slot="header">
        <span>供应商管理</span>
        <el-button type="primary" size="small" style="float: right">新增供应商</el-button>
      </div>
      <data-table
        :data="supplierList"
        :loading="loading"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handlePageChange"
      >
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="code" label="供应商编码" width="120"></el-table-column>
        <el-table-column prop="name" label="供应商名称" width="180"></el-table-column>
        <el-table-column prop="contact" label="联系人" width="120"></el-table-column>
        <el-table-column prop="phone" label="联系电话" width="130"></el-table-column>
        <el-table-column prop="address" label="地址" min-width="200"></el-table-column>
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
          </template>
        </el-table-column>
      </data-table>
    </el-card>
  </div>
</template>

<script>
import { DataTable } from '@/components/common';
import { getSuppliers } from '@/api/baseData';

export default {
  name: 'BaseDataSupplier',
  components: {
    DataTable,
  },
  data() {
    return {
      loading: false,
      supplierList: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
    };
  },
  mounted() {
    this.loadSuppliers();
  },
  methods: {
    async loadSuppliers() {
      this.loading = true;
      try {
        const res = await getSuppliers({
          page: this.currentPage,
          pageSize: this.pageSize,
        });
        this.supplierList = res.data.list || [];
        this.total = res.data.total || 0;
      } catch (error) {
        console.error('加载供应商失败:', error);
      } finally {
        this.loading = false;
      }
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.loadSuppliers();
    },
  },
};
</script>

<style scoped>
.supplier-page {
  padding: 20px;
}
</style>
