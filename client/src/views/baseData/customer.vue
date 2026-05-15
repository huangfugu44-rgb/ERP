<template>
  <div class="customer-page">
    <el-card>
      <div slot="header">
        <span>客户管理</span>
        <el-button type="primary" size="small" style="float: right">新增客户</el-button>
      </div>
      <data-table
        :data="customerList"
        :loading="loading"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handlePageChange"
      >
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="code" label="客户编码" width="120"></el-table-column>
        <el-table-column prop="name" label="客户名称" width="180"></el-table-column>
        <el-table-column prop="contact" label="联系人" width="120"></el-table-column>
        <el-table-column prop="phone" label="联系电话" width="130"></el-table-column>
        <el-table-column prop="level" label="客户等级" width="100"></el-table-column>
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
import { getCustomers } from '@/api/baseData';

export default {
  name: 'BaseDataCustomer',
  components: {
    DataTable,
  },
  data() {
    return {
      loading: false,
      customerList: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
    };
  },
  mounted() {
    this.loadCustomers();
  },
  methods: {
    async loadCustomers() {
      this.loading = true;
      try {
        const res = await getCustomers({
          page: this.currentPage,
          pageSize: this.pageSize,
        });
        this.customerList = res.data.list || [];
        this.total = res.data.total || 0;
      } catch (error) {
        console.error('加载客户失败:', error);
      } finally {
        this.loading = false;
      }
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.loadCustomers();
    },
  },
};
</script>

<style scoped>
.customer-page {
  padding: 20px;
}
</style>
