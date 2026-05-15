<template>
  <div class="sales-outbound-page">
    <el-card>
      <div slot="header">
        <span>销售出库单</span>
        <el-button type="primary" size="small" style="float: right">新增出库单</el-button>
      </div>
      <data-table
        :data="outboundList"
        :loading="loading"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handlePageChange"
      >
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="outboundNo" label="出库单号" width="180"></el-table-column>
        <el-table-column prop="salesOrderNo" label="销售单号" width="180"></el-table-column>
        <el-table-column prop="customerName" label="客户名称" width="150"></el-table-column>
        <el-table-column prop="warehouseName" label="仓库" width="120"></el-table-column>
        <el-table-column prop="totalQuantity" label="出库数量" width="100"></el-table-column>
        <el-table-column prop="totalAmount" label="出库金额" width="120"></el-table-column>
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
import { getOutboundOrders } from '@/api/sales';

export default {
  name: 'SalesOutbound',
  components: {
    DataTable,
  },
  data() {
    return {
      loading: false,
      outboundList: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
    };
  },
  mounted() {
    this.loadOutboundOrders();
  },
  methods: {
    async loadOutboundOrders() {
      this.loading = true;
      try {
        const res = await getOutboundOrders({
          page: this.currentPage,
          pageSize: this.pageSize,
        });
        this.outboundList = res.data.list || [];
        this.total = res.data.total || 0;
      } catch (error) {
        console.error('加载出库单失败:', error);
      } finally {
        this.loading = false;
      }
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.loadOutboundOrders();
    },
  },
};
</script>

<style scoped>
.sales-outbound-page {
  padding: 20px;
}
</style>
