<template>
  <div class="auth-overlay" @click.self="emit('close')">
    <div class="auth-card">
      <button type="button" class="close-btn" aria-label="关闭" @click="emit('close')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <div class="auth-tabs">
        <button
          type="button"
          class="tab"
          :class="{ active: mode === 'login' }"
          @click="mode = 'login'"
        >
          登录
        </button>
        <button
          type="button"
          class="tab"
          :class="{ active: mode === 'register' }"
          @click="mode = 'register'"
        >
          注册
        </button>
      </div>
      <form v-if="mode === 'login'" class="auth-form" @submit.prevent="handleLogin">
        <div class="field">
          <label for="login-username">用户名或邮箱</label>
          <input
            id="login-username"
            v-model="loginForm.username"
            type="text"
            autocomplete="username"
            placeholder="请输入用户名或邮箱"
            required
          />
        </div>
        <div class="field">
          <label for="login-password">密码</label>
          <input
            id="login-password"
            v-model="loginForm.password"
            type="password"
            autocomplete="current-password"
            placeholder="请输入密码"
            required
          />
        </div>
        <p v-if="authError" class="error-msg">{{ authError }}</p>
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '登录中…' : '登录' }}
        </button>
      </form>
      <form v-else class="auth-form" @submit.prevent="handleRegister">
        <div class="field">
          <label for="reg-username">用户名</label>
          <input
            id="reg-username"
            v-model="registerForm.username"
            type="text"
            autocomplete="username"
            placeholder="请输入用户名"
            required
          />
        </div>
        <div class="field">
          <label for="reg-email">邮箱</label>
          <input
            id="reg-email"
            v-model="registerForm.email"
            type="email"
            autocomplete="email"
            placeholder="请输入邮箱"
          />
        </div>
        <div class="field">
          <label for="reg-password">密码</label>
          <input
            id="reg-password"
            v-model="registerForm.password"
            type="password"
            autocomplete="new-password"
            placeholder="请输入密码"
            required
          />
        </div>
        <p v-if="authError" class="error-msg">{{ authError }}</p>
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '注册中…' : '创建账号' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuth } from '../composables/useAuth.js'

const emit = defineEmits(['close', 'success'])

const { login: doLogin, register: doRegister } = useAuth()

const mode = ref('login')
const loading = ref(false)
const authError = ref('')

const loginForm = ref({ username: '', password: '' })
const registerForm = ref({ username: '', email: '', password: '' })

watch(mode, () => {
  authError.value = ''
})

async function handleLogin() {
  authError.value = ''
  loading.value = true
  try {
    await doLogin({
      username: loginForm.value.username,
      password: loginForm.value.password,
    })
    emit('success')
    emit('close')
  } catch (e) {
    authError.value = e?.data?.detail || e?.message || '登录失败'
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  authError.value = ''
  loading.value = true
  try {
    await doRegister({
      username: registerForm.value.username,
      email: registerForm.value.email || undefined,
      password: registerForm.value.password,
    })
    emit('success')
    emit('close')
  } catch (e) {
    authError.value = e?.data?.detail || e?.message || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
}
.auth-card {
  position: relative;
  width: 100%;
  max-width: 400px;
  padding: 32px 40px 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
}
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px;
  color: #5f6368;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 50%;
}
.close-btn:hover {
  background: #f1f3f4;
  color: #202124;
}
.auth-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 28px;
}
.tab {
  padding: 8px 16px;
  font-size: 15px;
  color: #5f6368;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.tab:hover {
  color: #202124;
  background: #f1f3f4;
}
.tab.active {
  color: #202124;
  font-weight: 500;
  background: #e8f0fe;
  color: #1a73e8;
}
.auth-form .field {
  margin-bottom: 20px;
}
.auth-form label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #202124;
}
.auth-form input {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  font-size: 15px;
  color: #202124;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}
.auth-form input:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
}
.auth-form input::placeholder {
  color: #9aa0a6;
}
.error-msg {
  margin: -8px 0 12px;
  font-size: 13px;
  color: #d93025;
}
.submit-btn {
  width: 100%;
  height: 44px;
  margin-top: 8px;
  font-size: 15px;
  font-weight: 500;
  color: #fff;
  background: #1a73e8;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.submit-btn:hover:not(:disabled) {
  background: #1765cc;
}
.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
