<template>
  <div class="purchase-order-page">
    <el-card>
      <div slot="header">
        <span>采购单管理</span>
        <el-button type="primary" size="small" style="float: right">新增采购单</el-button>
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
        <el-table-column prop="supplierName" label="供应商" width="150"></el-table-column>
        <el-table-column prop="totalAmount" label="总金额" width="120"></el-table-column>
        <el-table-column prop="discountAmount" label="优惠金额" width="100"></el-table-column>
        <el-table-column prop="actualAmount" label="应付金额" width="120"></el-table-column>
        <el-table-column prop="paymentStatus" label="付款状态" width="100"></el-table-column>
        <el-table-column prop="status" label="状态" width="100"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button link size="small">查看</el-button>
            <el-button link size="small">编辑</el-button>
            <el-button link size="small">入库</el-button>
          </template>
        </el-table-column>
      </data-table>
    </el-card>
  </div>
</template>

<script>
import { DataTable } from '@/components/common';
import { getPurchaseOrders } from '@/api/purchase';

export default {
  name: 'PurchaseOrder',
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
        const res = await getPurchaseOrders({
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
.purchase-order-page {
  padding: 20px;
}
</style>
