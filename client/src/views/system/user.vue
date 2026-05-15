<template>
  <div class="system-user-page">
    <el-card>
      <div slot="header">
        <span>用户管理</span>
        <el-button type="primary" size="small" style="float: right">新增用户</el-button>
      </div>
      <data-table
        :data="userList"
        :loading="loading"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handlePageChange"
      >
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="username" label="用户名" width="120"></el-table-column>
        <el-table-column prop="realName" label="真实姓名" width="120"></el-table-column>
        <el-table-column prop="phone" label="手机号" width="130"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
        <el-table-column prop="roleName" label="角色" width="120"></el-table-column>
        <el-table-column prop="department" label="部门" width="120"></el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录" width="180"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 1" type="success" size="small">启用</el-tag>
            <el-tag v-else type="info" size="small">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button link size="small">编辑</el-button>
            <el-button link size="small">重置密码</el-button>
          </template>
        </el-table-column>
      </data-table>
    </el-card>
  </div>
</template>

<script>
import { DataTable } from '@/components/common';
import { getUsers } from '@/api/system';

export default {
  name: 'SystemUser',
  components: {
    DataTable,
  },
  data() {
    return {
      loading: false,
      userList: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
    };
  },
  mounted() {
    this.loadUsers();
  },
  methods: {
    async loadUsers() {
      this.loading = true;
      try {
        const res = await getUsers({
          page: this.currentPage,
          pageSize: this.pageSize,
        });
        this.userList = res.data.list || [];
        this.total = res.data.total || 0;
      } catch (error) {
        console.error('加载用户失败:', error);
      } finally {
        this.loading = false;
      }
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.loadUsers();
    },
  },
};
</script>

<style scoped>
.system-user-page {
  padding: 20px;
}
</style>
