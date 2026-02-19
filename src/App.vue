<template>
  <div class="app">
    <AppHeader />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import { useAuth } from './composables/useAuth.js'

const { setToken, fetchUser } = useAuth()

onMounted(() => {
  const hash = window.location.hash?.replace(/^#/, '') || ''
  const search = window.location.search?.replace(/^\?/, '') || ''
  const params = new URLSearchParams(hash || search)
  const token = params.get('access_token') || params.get('token')
  const userId = params.get('user_id') || params.get('userId')
  if (token) {
    setToken(token, userId || null)
    fetchUser().then(() => {
      const url = window.location.origin + window.location.pathname
      window.history.replaceState(null, '', url)
    })
  }
})
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
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background-color: #F5F7FA;
}
.main-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}
</style>
