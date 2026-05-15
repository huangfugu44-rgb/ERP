<template>
  <div class="warehouse-inventory-page">
    <el-card>
      <div slot="header">
        <span>库存查询</span>
        <el-button type="primary" size="small" style="float: right">库存盘点</el-button>
      </div>
      <data-table
        :data="inventoryList"
        :loading="loading"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handlePageChange"
      >
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="warehouseName" label="仓库" width="120"></el-table-column>
        <el-table-column prop="productCode" label="商品编码" width="120"></el-table-column>
        <el-table-column prop="productName" label="商品名称" width="180"></el-table-column>
        <el-table-column prop="specification" label="规格" width="120"></el-table-column>
        <el-table-column prop="unit" label="单位" width="80"></el-table-column>
        <el-table-column prop="quantity" label="库存数量" width="100"></el-table-column>
        <el-table-column prop="safeQuantity" label="安全库存" width="100"></el-table-column>
        <el-table-column prop="price" label="单价" width="100"></el-table-column>
        <el-table-column prop="amount" label="库存金额" width="120"></el-table-column>
        <el-table-column prop="status" label="预警状态" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.quantity < scope.row.safeQuantity" type="danger" size="small">
              库存不足
            </el-tag>
            <el-tag v-else type="success" size="small">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template slot-scope="scope">
            <el-button link size="small">调拨</el-button>
          </template>
        </el-table-column>
      </data-table>
    </el-card>
  </div>
</template>

<script>
import { DataTable } from '@/components/common';
import { getInventory } from '@/api/warehouse';

export default {
  name: 'WarehouseInventory',
  components: {
    DataTable,
  },
  data() {
    return {
      loading: false,
      inventoryList: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
    };
  },
  mounted() {
    this.loadInventory();
  },
  methods: {
    async loadInventory() {
      this.loading = true;
      try {
        const res = await getInventory({
          page: this.currentPage,
          pageSize: this.pageSize,
        });
        this.inventoryList = res.data.list || [];
        this.total = res.data.total || 0;
      } catch (error) {
        console.error('加载库存失败:', error);
      } finally {
        this.loading = false;
      }
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.loadInventory();
    },
  },
};
</script>

<style scoped>
.warehouse-inventory-page {
  padding: 20px;
}
</style>
