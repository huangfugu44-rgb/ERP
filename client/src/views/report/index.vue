<template>
  <div class="report-page">
    <el-card>
      <div slot="header">
        <span>报表中心</span>
      </div>
      <div class="report-list">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="report-item">
              <i class="el-icon-document"></i>
              <span>销售报表</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="report-item">
              <i class="el-icon-goods"></i>
              <span>采购报表</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="report-item">
              <i class="el-icon-box"></i>
              <span>库存报表</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="report-item">
              <i class="el-icon-money"></i>
              <span>财务报表</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'ReportIndex',
};
</script>

<style scoped>
.report-page {
  padding: 20px;
}

.report-list {
  padding: 20px 0;
}

.report-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.report-item:hover {
  background: #e4e7ed;
  transform: translateY(-5px);
}

.report-item i {
  font-size: 48px;
  color: #409EFF;
  margin-bottom: 10px;
}

.report-item span {
  font-size: 14px;
  color: #606266;
}
</style>
