<template>
  <div class="sales-order-page">
    <el-card>
      <div slot="header">
        <span>销售单管理</span>
        <el-button type="primary" size="small" style="float: right">新增销售单</el-button>
      </div>
      <data-table
        :data="orderList"
        :loading="loading"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handlePageChange"
      >
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="orderNo" label="单据编号" width="180"></el-table-column>
        <el-table-column prop="customerName" label="客户名称" width="150"></el-table-column>
        <el-table-column prop="totalAmount" label="总金额" width="120"></el-table-column>
        <el-table-column prop="discountAmount" label="优惠金额" width="100"></el-table-column>
        <el-table-column prop="actualAmount" label="应收金额" width="120"></el-table-column>
        <el-table-column prop="receivedAmount" label="已收金额" width="120"></el-table-column>
        <el-table-column prop="paymentStatus" label="收款状态" width="100"></el-table-column>
        <el-table-column prop="status" label="状态" width="100"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button link size="small">查看</el-button>
            <el-button link size="small">编辑</el-button>
            <el-button link size="small">出库</el-button>
          </template>
        </el-table-column>
      </data-table>
    </el-card>
  </div>
</template>

<script>
import { DataTable } from '@/components/common';
import { getSalesOrders } from '@/api/sales';

export default {
  name: 'SalesOrder',
  components: {
    DataTable,
  },
  data() {
    return {
      loading: false,
      orderList: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
    };
  },
  mounted() {
    this.loadOrders();
  },
  methods: {
    async loadOrders() {
      this.loading = true;
      try {
        const res = await getSalesOrders({
          page: this.currentPage,
          pageSize: this.pageSize,
        });
        this.orderList = res.data.list || [];
        this.total = res.data.total || 0;
      } catch (error) {
        console.error('加载订单失败:', error);
      } finally {
        this.loading = false;
      }
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.loadOrders();
    },
  },
};
</script>

<style scoped>
.sales-order-page {
  padding: 20px;
}
</style>
