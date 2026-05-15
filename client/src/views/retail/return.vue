<template>
  <div class="retail-return-page">
    <el-card>
      <div slot="header">
        <span>零售退货单</span>
      </div>
      <data-table :data="returnList" :loading="loading" :total="total">
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="returnNo" label="退货单号" width="180"></el-table-column>
        <el-table-column prop="originalOrderNo" label="原单号" width="180"></el-table-column>
        <el-table-column prop="customerName" label="客户名称" width="120"></el-table-column>
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
import { getRetailReturns } from '@/api/retail';

export default {
  name: 'RetailReturn',
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
        const res = await getRetailReturns({});
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
.retail-return-page {
  padding: 20px;
}
</style>
