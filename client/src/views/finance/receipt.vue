<template>
  <div class="finance-receipt-page">
    <el-card>
      <div slot="header">
        <span>收款单</span>
        <el-button type="primary" size="small" style="float: right">新增收款单</el-button>
      </div>
      <data-table
        :data="receiptList"
        :loading="loading"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handlePageChange"
      >
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="receiptNo" label="收款单号" width="180"></el-table-column>
        <el-table-column prop="customerName" label="客户名称" width="150"></el-table-column>
        <el-table-column prop="salesOrderNo" label="销售单号" width="180"></el-table-column>
        <el-table-column prop="amount" label="收款金额" width="120"></el-table-column>
        <el-table-column prop="paymentMethod" label="收款方式" width="120"></el-table-column>
        <el-table-column prop="accountName" label="收款账户" width="120"></el-table-column>
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
import { getReceipts } from '@/api/finance';

export default {
  name: 'FinanceReceipt',
  components: {
    DataTable,
  },
  data() {
    return {
      loading: false,
      receiptList: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
    };
  },
  mounted() {
    this.loadReceipts();
  },
  methods: {
    async loadReceipts() {
      this.loading = true;
      try {
        const res = await getReceipts({
          page: this.currentPage,
          pageSize: this.pageSize,
        });
        this.receiptList = res.data.list || [];
        this.total = res.data.total || 0;
      } catch (error) {
        console.error('加载收款单失败:', error);
      } finally {
        this.loading = false;
      }
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.loadReceipts();
    },
  },
};
</script>

<style scoped>
.finance-receipt-page {
  padding: 20px;
}
</style>
