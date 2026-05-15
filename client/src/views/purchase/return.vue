<template>
  <div class="purchase-return-page">
    <el-card>
      <div slot="header">
        <span>采购退货单</span>
      </div>
      <data-table :data="returnList" :loading="loading" :total="total">
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="returnNo" label="退货单号" width="180"></el-table-column>
        <el-table-column prop="originalOrderNo" label="原采购单号" width="180"></el-table-column>
        <el-table-column prop="supplierName" label="供应商" width="150"></el-table-column>
        <el-table-column prop="warehouseName" label="仓库" width="120"></el-table-column>
        <el-table-column prop="totalQuantity" label="退货数量" width="100"></el-table-column>
        <el-table-column prop="amount" label="退货金额" width="120"></el-table-column>
        <el-table-column prop="reason" label="退货原因" width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="100"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template slot-scope="scope">
            <el-button link size="small">查看</el-button>
            <el-button link size="small">审核</el-button>
          </template>
        </el-table-column>
      </data-table>
    </el-card>
  </div>
</template>

<script>
import { DataTable } from '@/components/common';
import { getPurchaseReturns } from '@/api/purchase';

export default {
  name: 'PurchaseReturn',
  components: {
    DataTable,
  },
  data() {
    return {
      loading: false,
      returnList: [],
      total: 0,
    };
  },
  mounted() {
    this.loadReturns();
  },
  methods: {
    async loadReturns() {
      this.loading = true;
      try {
        const res = await getPurchaseReturns({});
        this.returnList = res.data.list || [];
        this.total = res.data.total || 0;
      } catch (error) {
        console.error('加载退货单失败:', error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.purchase-return-page {
  padding: 20px;
}
</style>
