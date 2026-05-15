<template>
  <div class="account-page">
    <el-card>
      <div slot="header">
        <span>账户管理</span>
        <el-button type="primary" size="small" style="float: right">新增账户</el-button>
      </div>
      <data-table :data="accountList" :loading="loading">
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="code" label="账户编码" width="120"></el-table-column>
        <el-table-column prop="name" label="账户名称" width="180"></el-table-column>
        <el-table-column prop="bank" label="开户银行" width="150"></el-table-column>
        <el-table-column prop="accountNo" label="账号" width="200"></el-table-column>
        <el-table-column prop="balance" label="余额" width="120">
          <template slot-scope="scope">
            <span style="color: #67C23A">{{ scope.row.balance }}</span>
          </template>
        </el-table-column>
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
import { getAccounts } from '@/api/baseData';

export default {
  name: 'BaseDataAccount',
  components: {
    DataTable,
  },
  data() {
    return {
      loading: false,
      accountList: [],
    };
  },
  mounted() {
    this.loadAccounts();
  },
  methods: {
    async loadAccounts() {
      this.loading = true;
      try {
        const res = await getAccounts({});
        this.accountList = res.data.list || [];
      } catch (error) {
        console.error('加载账户失败:', error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.account-page {
  padding: 20px;
}
</style>
