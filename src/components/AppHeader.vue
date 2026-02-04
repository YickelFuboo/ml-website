<template>
  <header class="header">
    <div class="header-inner">
      <div class="header-left">
        <div class="logo">
          <span class="logo-icon" aria-hidden="true">◇</span>
          <span class="product-title">魔灵（MOLING）</span>
        </div>
      </div>
      <div class="header-right">
        <div class="product-select-wrapper">
          <select
            v-model="selectedProduct"
            class="product-select"
            aria-label="产品选择"
          >
            <option
              v-for="item in productOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </option>
          </select>
        </div>
        <button
          type="button"
          class="header-btn icon-btn"
          aria-label="设置"
          @click="onSettings"
        >
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          <span class="btn-text">设置</span>
        </button>
        <button
          type="button"
          class="header-btn user-btn"
          aria-label="用户"
          @click="onUser"
        >
          <span class="user-avatar">Y</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'

const selectedProduct = ref('moling')
const productOptions = ref([
  { value: 'moling', label: '魔灵' },
  { value: 'notebook', label: '笔记本' },
])

function onSettings() {
  console.log('设置')
}

function onUser() {
  console.log('用户')
}
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 56px;
  background-color: #F5F7FA;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.header-inner {
  max-width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-left {
  display: flex;
  align-items: center;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  color: #fff;
  font-size: 16px;
  border-radius: 50%;
}
.product-title {
  font-size: 18px;
  font-weight: 500;
  color: #202124;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.product-select-wrapper {
  position: relative;
}
.product-select {
  height: 36px;
  padding: 0 32px 0 12px;
  font-size: 14px;
  color: #202124;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235f6368' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}
.product-select:hover {
  border-color: rgba(0, 0, 0, 0.24);
}
.product-select:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
}
.header-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  font-size: 14px;
  color: #202124;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.header-btn:hover {
  background: #f1f3f4;
  border-color: rgba(0, 0, 0, 0.18);
}
.icon-btn .btn-icon {
  width: 20px;
  height: 20px;
}
.user-btn {
  padding: 0;
  width: 36px;
  border-radius: 50%;
}
.user-avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background: #00bcd4;
  border-radius: 50%;
}
</style>
