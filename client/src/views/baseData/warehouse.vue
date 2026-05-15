<template>
  <div class="warehouse-page">
    <el-card>
      <div slot="header">
        <span>仓库管理</span>
        <el-button type="primary" size="small" style="float: right">新增仓库</el-button>
      </div>
      <data-table :data="warehouseList" :loading="loading">
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="code" label="仓库编码" width="120"></el-table-column>
        <el-table-column prop="name" label="仓库名称" width="180"></el-table-column>
        <el-table-column prop="address" label="仓库地址" min-width="200"></el-table-column>
        <el-table-column prop="manager" label="负责人" width="120"></el-table-column>
        <el-table-column prop="phone" label="联系电话" width="130"></el-table-column>
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
import { getWarehouses } from '@/api/baseData';

export default {
  name: 'BaseDataWarehouse',
  components: {
    DataTable,
  },
  data() {
    return {
      loading: false,
      warehouseList: [],
    };
  },
  mounted() {
    this.loadWarehouses();
  },
  methods: {
    async loadWarehouses() {
      this.loading = true;
      try {
        const res = await getWarehouses({});
        this.warehouseList = res.data.list || [];
      } catch (error) {
        console.error('加载仓库失败:', error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.warehouse-page {
  padding: 20px;
}
</style>
