<template>
  <div class="edit-overlay" @click.self="emit('close')">
    <div class="edit-card">
      <div class="edit-header">
        <h2 class="edit-title">修改资料</h2>
        <button type="button" class="close-btn" aria-label="关闭" @click="emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <form class="edit-form" @submit.prevent="handleSubmit">
        <div class="field">
          <label>用户名</label>
          <input v-model="form.username" type="text" disabled class="disabled" />
        </div>
        <div class="field">
          <label for="edit-desc">个人描述</label>
          <textarea
            id="edit-desc"
            v-model="form.description"
            rows="3"
            placeholder="选填"
          />
        </div>
        <div class="field">
          <label for="edit-password">新密码（不修改请留空）</label>
          <div class="password-row">
            <input
              id="edit-password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="留空表示不修改"
            />
            <button type="button" class="pwd-toggle" :aria-label="showPassword ? '隐藏密码' : '显示密码'" @click="showPassword = !showPassword">
              <svg v-if="!showPassword" class="pwd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else class="pwd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
          </div>
        </div>
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '保存中…' : '保存' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuth } from '../composables/useAuth.js'

const props = defineProps({
  user: { type: Object, default: null },
})

const emit = defineEmits(['close', 'success'])

const { user, updateUser } = useAuth()

const showPassword = ref(false)
const form = ref({
  username: '',
  description: '',
  password: '',
})
const loading = ref(false)
const errorMsg = ref('')

watch(
  () => props.user || user.value,
  (u) => {
    if (u) {
      form.value = {
        username: u.username ?? u.name ?? '',
        description: u.description ?? u.bio ?? '',
        password: '',
      }
    }
    errorMsg.value = ''
  },
  { immediate: true }
)

async function handleSubmit() {
  errorMsg.value = ''
  loading.value = true
  try {
    const body = {}
    if (form.value.description !== undefined) body.description = form.value.description
    if (form.value.password && form.value.password.trim()) body.password = form.value.password.trim()
    await updateUser(body)
    emit('success')
    emit('close')
  } catch (e) {
    errorMsg.value = e?.data?.detail || e?.message || '保存失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.edit-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
}
.edit-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: 24px 32px 32px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
}
.edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.edit-title {
  font-size: 18px;
  font-weight: 500;
  color: #202124;
}
.close-btn {
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
.edit-form .field {
  margin-bottom: 20px;
}
.edit-form label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #202124;
}
.edit-form input,
.edit-form textarea {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  color: #202124;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}
.edit-form input.disabled {
  background: #f1f3f4;
  color: #5f6368;
  cursor: not-allowed;
}
.edit-form textarea {
  resize: vertical;
  min-height: 72px;
}
.edit-form input:focus,
.edit-form textarea:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
}
.password-row {
  display: flex;
  align-items: center;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
}
.password-row:focus-within {
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
}
.password-row input {
  flex: 1;
  min-width: 0;
  border: none;
  border-radius: 0;
}
.password-row input:focus {
  box-shadow: none;
}
.pwd-toggle {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  color: #5f6368;
  background: none;
  border: none;
  cursor: pointer;
}
.pwd-toggle:hover {
  color: #202124;
  background: rgba(0, 0, 0, 0.04);
}
.pwd-icon {
  display: block;
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
