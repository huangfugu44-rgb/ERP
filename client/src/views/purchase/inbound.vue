<template>
  <div class="purchase-inbound-page">
    <el-card>
      <div slot="header">
        <span>采购入库单</span>
        <el-button type="primary" size="small" style="float: right">新增入库单</el-button>
      </div>
      <data-table
        :data="inboundList"
        :loading="loading"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handlePageChange"
      >
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="inboundNo" label="入库单号" width="180"></el-table-column>
        <el-table-column prop="purchaseOrderNo" label="采购单号" width="180"></el-table-column>
        <el-table-column prop="supplierName" label="供应商" width="150"></el-table-column>
        <el-table-column prop="warehouseName" label="仓库" width="120"></el-table-column>
        <el-table-column prop="totalQuantity" label="入库数量" width="100"></el-table-column>
        <el-table-column prop="totalAmount" label="入库金额" width="120"></el-table-column>
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
import { getInboundOrders } from '@/api/purchase';

export default {
  name: 'PurchaseInbound',
  components: {
    DataTable,
  },
  data() {
    return {
      loading: false,
      inboundList: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
    };
  },
  mounted() {
    this.loadInboundOrders();
  },
  methods: {
    async loadInboundOrders() {
      this.loading = true;
      try {
        const res = await getInboundOrders({
          page: this.currentPage,
          pageSize: this.pageSize,
        });
        this.inboundList = res.data.list || [];
        this.total = res.data.total || 0;
      } catch (error) {
        console.error('加载入库单失败:', error);
      } finally {
        this.loading = false;
      }
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.loadInboundOrders();
    },
  },
};
</script>

<style scoped>
.purchase-inbound-page {
  padding: 20px;
}
</style>
