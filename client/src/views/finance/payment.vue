<template>
  <div class="finance-payment-page">
    <el-card>
      <div slot="header">
        <span>付款单</span>
        <el-button type="primary" size="small" style="float: right">新增付款单</el-button>
      </div>
      <data-table
        :data="paymentList"
        :loading="loading"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handlePageChange"
      >
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="paymentNo" label="付款单号" width="180"></el-table-column>
        <el-table-column prop="supplierName" label="供应商名称" width="150"></el-table-column>
        <el-table-column prop="purchaseOrderNo" label="采购单号" width="180"></el-table-column>
        <el-table-column prop="amount" label="付款金额" width="120"></el-table-column>
        <el-table-column prop="paymentMethod" label="付款方式" width="120"></el-table-column>
        <el-table-column prop="accountName" label="付款账户" width="120"></el-table-column>
        <el-table-column prop="status" label="状态" width="100"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template slot-scope="scope">
            <el-button link size="small">查看</el-button>
          </template>
        </el-table-column>
      </data-table>
    </el-card>
  </div>
</template>

<script>
import { DataTable } from '@/components/common';
import { getPayments } from '@/api/finance';

export default {
  name: 'FinancePayment',
  components: {
    DataTable,
  },
  data() {
    return {
      loading: false,
      paymentList: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
    };
  },
  mounted() {
    this.loadPayments();
  },
  methods: {
    async loadPayments() {
      this.loading = true;
      try {
        const res = await getPayments({
          page: this.currentPage,
          pageSize: this.pageSize,
        });
        this.paymentList = res.data.list || [];
        this.total = res.data.total || 0;
      } catch (error) {
        console.error('加载付款单失败:', error);
      } finally {
        this.loading = false;
      }
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.loadPayments();
    },
  },
};
</script>

<style scoped>
.finance-payment-page {
  padding: 20px;
}
</style>
