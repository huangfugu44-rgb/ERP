<template>
  <div class="dashboard">
    <div class="stats-grid">
      <stat-card
        v-for="stat in statsData"
        :key="stat.title"
        :title="stat.title"
        :value="stat.value"
        :icon="stat.icon"
        :type="stat.type"
        :description="stat.description"
      ></stat-card>
    </div>

    <div class="charts-grid">
      <chart title="销售趋势" type="line" :data="salesTrendData" height="350px"></chart>
      <chart title="销售占比" type="pie" :data="salesPieData" height="350px"></chart>
    </div>

    <div class="dashboard-panels">
      <div class="recent-orders">
        <h3>最近订单</h3>
        <data-table :data="recentOrders" :show-pagination="false">
          <el-table-column prop="orderNo" label="订单号" width="180"></el-table-column>
          <el-table-column prop="customer" label="客户" width="150"></el-table-column>
          <el-table-column prop="amount" label="金额" width="120"></el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template slot-scope="{ row }">
              <el-tag :type="row.statusType" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间"></el-table-column>
        </data-table>
      </div>

      <div class="todos-panel">
        <h3>待办事项</h3>
        <div class="todos-list">
          <div
            v-for="todo in todos"
            :key="todo.id"
            class="todo-item"
            :class="{ 'todo-item--done': todo.done }"
            @click="toggleTodo(todo)"
          >
            <el-checkbox v-model="todo.done" @change="handleTodoChange(todo)"></el-checkbox>
            <span class="todo-text">{{ todo.text }}</span>
            <el-tag :type="todo.priorityType" size="small">{{ todo.priority }}</el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { StatCard, Chart } from '@/components/business';
import { DataTable } from '@/components/common';
import { getDashboardStats, getSalesTrend, getCategorySales, getRecentOrders, getTodos, updateTodo } from '@/api/dashboard';

export default {
  name: 'DashboardIndex',
  components: {
    StatCard,
    Chart,
    DataTable,
  },
  data() {
    return {
      statsData: [],
      salesTrendData: {
        xAxis: [],
        legend: ['销售额', '订单数'],
        series: [
          { name: '销售额', type: 'line', data: [] },
          { name: '订单数', type: 'line', data: [] },
        ],
      },
      salesPieData: {
        series: [],
      },
      recentOrders: [],
      todos: [],
      loading: false,
    };
  },
  mounted() {
    this.loadDashboardData();
  },
  methods: {
    async loadDashboardData() {
      this.loading = true;
      try {
        await Promise.all([
          this.loadStats(),
          this.loadSalesTrend(),
          this.loadCategorySales(),
          this.loadRecentOrders(),
          this.loadTodos(),
        ]);
      } catch (error) {
        console.error('加载仪表盘数据失败:', error);
        this.$message.error('加载数据失败');
      } finally {
        this.loading = false;
      }
    },
    async loadStats() {
      try {
        const res = await getDashboardStats();
        if (res.success && res.data) {
          const data = res.data;
          this.statsData = [
            {
              title: '今日销售额',
              value: data.todaySales || 0,
              icon: 'el-icon-money',
              type: 'primary',
              description: '今日销售总收入',
            },
            {
              title: '今日订单数',
              value: data.todayOrders || 0,
              icon: 'el-icon-document',
              type: 'success',
              description: '今日订单总数',
            },
            {
              title: '待处理订单',
              value: data.pendingReceivable || 0,
              icon: 'el-icon-warning',
              type: 'warning',
              description: '待确认/待发货订单',
            },
            {
              title: '库存预警',
              value: data.inventory?.alertCount || 0,
              icon: 'el-icon-error',
              type: 'danger',
              description: '库存不足商品数',
            },
          ];
        }
      } catch (error) {
        console.error('加载统计数据失败:', error);
      }
    },
    async loadSalesTrend() {
      try {
        const res = await getSalesTrend({ period: 'week' });
        if (res.success && res.data) {
          this.salesTrendData = {
            xAxis: res.data.map((item) => item.date),
            legend: ['销售额', '订单数'],
            series: [
              {
                name: '销售额',
                type: 'line',
                data: res.data.map((item) => item.sales),
              },
              {
                name: '订单数',
                type: 'line',
                data: res.data.map((item) => item.orders),
              },
            ],
          };
        }
      } catch (error) {
        console.error('加载销售趋势失败:', error);
      }
    },
    async loadCategorySales() {
      try {
        const res = await getCategorySales();
        if (res.success && res.data) {
          this.salesPieData = {
            series: res.data.map((item) => ({
              value: item.value,
              name: item.name,
            })),
          };
        }
      } catch (error) {
        console.error('加载分类销售失败:', error);
      }
    },
    async loadRecentOrders() {
      try {
        const res = await getRecentOrders({ page: 1, pageSize: 5 });
        if (res.success && res.data) {
          this.recentOrders = res.data;
        }
      } catch (error) {
        console.error('加载最近订单失败:', error);
      }
    },
    async loadTodos() {
      try {
        const res = await getTodos();
        if (res.success && res.data) {
          this.todos = res.data;
        }
      } catch (error) {
        console.error('加载待办事项失败:', error);
      }
    },
    async handleTodoChange(todo) {
      try {
        await updateTodo(todo.id, { done: todo.done });
        this.$message.success(todo.done ? '已完成' : '已取消');
      } catch (error) {
        todo.done = !todo.done;
        this.$message.error('更新失败');
      }
    },
    toggleTodo(todo) {
      todo.done = !todo.done;
      this.handleTodoChange(todo);
    },
  },
};
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.dashboard-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.recent-orders,
.todos-panel {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}

.recent-orders h3,
.todos-panel h3 {
  margin: 0 0 16px 0;
}

.todos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  background: #f5f7fa;
  cursor: pointer;
  transition: all 0.3s;
}

.todo-item:hover {
  background: #ecf5ff;
}

.todo-item--done {
  opacity: 0.6;
}

.todo-item--done .todo-text {
  text-decoration: line-through;
}

.todo-text {
  flex: 1;
  font-size: 14px;
}
</style>
