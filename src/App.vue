<template>
  <div class="app">
    <AppHeader />
    <main class="main-content">
      <!-- 页面正式内容预留，后续添加 -->
    </main>
  </div>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body, #app {
  height: 100%;
}
.app {
  min-height: 100%;
  background-color: #F5F7FA;
}
.main-content {
  min-height: calc(100vh - 56px);
  padding: 0;
}
</style>
