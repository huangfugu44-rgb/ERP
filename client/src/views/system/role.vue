<template>
  <div class="system-role-page">
    <el-card>
      <div slot="header">
        <span>角色管理</span>
        <el-button type="primary" size="small" style="float: right">新增角色</el-button>
      </div>
      <data-table
        :data="roleList"
        :loading="loading"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handlePageChange"
      >
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="code" label="角色编码" width="120"></el-table-column>
        <el-table-column prop="name" label="角色名称" width="150"></el-table-column>
        <el-table-column prop="description" label="描述" min-width="200"></el-table-column>
        <el-table-column prop="userCount" label="用户数" width="100"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 1" type="success" size="small">启用</el-tag>
            <el-tag v-else type="info" size="small">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button link size="small">编辑</el-button>
            <el-button link size="small">权限</el-button>
            <el-button link size="small">删除</el-button>
          </template>
        </el-table-column>
      </data-table>
    </el-card>
  </div>
</template>

<script>
import { DataTable } from '@/components/common';
import { getRoles } from '@/api/system';

export default {
  name: 'SystemRole',
  components: {
    DataTable,
  },
  data() {
    return {
      loading: false,
      roleList: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
    };
  },
  mounted() {
    this.loadRoles();
  },
  methods: {
    async loadRoles() {
      this.loading = true;
      try {
        const res = await getRoles({
          page: this.currentPage,
          pageSize: this.pageSize,
        });
        this.roleList = res.data.list || [];
        this.total = res.data.total || 0;
      } catch (error) {
        console.error('加载角色失败:', error);
      } finally {
        this.loading = false;
      }
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.loadRoles();
    },
  },
};
</script>

<style scoped>
.system-role-page {
  padding: 20px;
}
</style>
