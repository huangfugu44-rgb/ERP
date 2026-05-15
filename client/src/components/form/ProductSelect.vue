<template>
  <div class="product-select">
    <el-select
      v-model="selectedValue"
      :placeholder="placeholder"
      :filterable="filterable"
      :remote="remote"
      :remote-method="handleRemoteSearch"
      :loading="loading"
      :disabled="disabled"
      :clearable="clearable"
      @change="handleChange"
    >
      <el-option
        v-for="item in options"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      >
        <span style="float: left">{{ item.name }}</span>
        <span style="float: right; color: #8492a6; font-size: 13px">
          {{ item.code }}
        </span>
      </el-option>
    </el-select>
  </div>
</template>

<script>
export default {
  name: 'ProductSelect',
  props: {
    value: {
      type: [String, Number],
      default: '',
    },
    placeholder: {
      type: String,
      default: '请选择商品',
    },
    filterable: {
      type: Boolean,
      default: true,
    },
    remote: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    products: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      selectedValue: this.value,
      options: this.products,
      loading: false,
    };
  },
  watch: {
    value(val) {
      this.selectedValue = val;
    },
    products(val) {
      this.options = val;
    },
  },
  methods: {
    handleRemoteSearch(query) {
      if (query !== '') {
        this.loading = true;
        this.$emit('search', query);
        setTimeout(() => {
          this.loading = false;
        }, 200);
      } else {
        this.options = this.products;
      }
    },
    handleChange(value) {
      const selectedProduct = this.options.find(item => item.id === value);
      this.$emit('input', value);
      this.$emit('change', value, selectedProduct);
    },
  },
};
</script>

<style scoped>
.product-select {
  width: 100%;
}
</style>
