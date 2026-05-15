<template>
  <div class="system-log-page">
    <el-card>
      <div slot="header">
        <span>操作日志</span>
      </div>
      <data-table
        :data="logList"
        :loading="loading"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handlePageChange"
      >
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="username" label="操作用户" width="120"></el-table-column>
        <el-table-column prop="module" label="模块" width="120"></el-table-column>
        <el-table-column prop="action" label="操作" width="120"></el-table-column>
        <el-table-column prop="description" label="描述" min-width="200"></el-table-column>
        <el-table-column prop="ip" label="IP地址" width="140"></el-table-column>
        <el-table-column prop="browser" label="浏览器" width="120"></el-table-column>
        <el-table-column prop="os" label="操作系统" width="100"></el-table-column>
        <el-table-column prop="createTime" label="操作时间" width="180"></el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template slot-scope="scope">
            <el-button link size="small">详情</el-button>
          </template>
        </el-table-column>
      </data-table>
    </el-card>
  </div>
</template>

<script>
import { DataTable } from '@/components/common';
import { getLogs } from '@/api/system';

export default {
  name: 'SystemLog',
  components: {
    DataTable,
  },
  data() {
    return {
      loading: false,
      logList: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
    };
  },
  mounted() {
    this.loadLogs();
  },
  methods: {
    async loadLogs() {
      this.loading = true;
      try {
        const res = await getLogs({
          page: this.currentPage,
          pageSize: this.pageSize,
        });
        this.logList = res.data.list || [];
        this.total = res.data.total || 0;
      } catch (error) {
        console.error('加载日志失败:', error);
      } finally {
        this.loading = false;
      }
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.loadLogs();
    },
  },
};
</script>

<style scoped>
.system-log-page {
  padding: 20px;
}
</style>
