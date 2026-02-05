<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="card">
      <div class="header">
        <h2 class="title">修改密码</h2>
        <button type="button" class="close-btn" aria-label="关闭" @click="emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <form class="form" @submit.prevent="handleSubmit">
        <div class="field">
          <label for="cp-old-password">当前密码</label>
          <div class="password-row">
            <input
              id="cp-old-password"
              v-model="form.old_password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="请输入当前密码"
            />
            <button type="button" class="pwd-toggle" :aria-label="showPassword ? '隐藏密码' : '显示密码'" @click="showPassword = !showPassword">
              <svg v-if="!showPassword" class="pwd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              <svg v-else class="pwd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
        <div class="field">
          <label for="cp-new-password">新密码</label>
          <div class="password-row">
            <input
              id="cp-new-password"
              v-model="form.new_password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="请输入新密码"
            />
            <button type="button" class="pwd-toggle" :aria-label="showPassword ? '隐藏密码' : '显示密码'" @click="showPassword = !showPassword">
              <svg v-if="!showPassword" class="pwd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              <svg v-else class="pwd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
        <div class="field">
          <label for="cp-confirm-password">再次输入新密码</label>
          <div class="password-row">
            <input
              id="cp-confirm-password"
              v-model="form.confirm_new_password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="请再次输入新密码"
            />
            <button type="button" class="pwd-toggle" :aria-label="showPassword ? '隐藏密码' : '显示密码'" @click="showPassword = !showPassword">
              <svg v-if="!showPassword" class="pwd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              <svg v-else class="pwd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
        <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>
        <div class="actions">
          <button type="button" class="btn secondary" @click="emit('close')">取消</button>
          <button type="submit" class="btn primary" :disabled="loading">{{ loading ? '提交中…' : '保存' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'

const emit = defineEmits(['close', 'success'])

const { changePassword, isLoggedIn } = useAuth()

const showPassword = ref(false)
const form = ref({
  old_password: '',
  new_password: '',
  confirm_new_password: '',
})
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

async function handleSubmit() {
  errorMsg.value = ''
  successMsg.value = ''
  const oldPwd = form.value.old_password?.trim()
  const newPwd = form.value.new_password?.trim()
  const confirmPwd = form.value.confirm_new_password?.trim() ?? ''
  if (!oldPwd) {
    errorMsg.value = '请填写当前密码'
    return
  }
  if (!newPwd) {
    errorMsg.value = '请填写新密码'
    return
  }
  if (newPwd !== confirmPwd) {
    errorMsg.value = '两次输入的新密码不一致'
    return
  }
  loading.value = true
  try {
    await changePassword({ old_password: oldPwd, new_password: newPwd })
    if (!isLoggedIn.value) {
      successMsg.value = '密码已修改，请重新登录'
    } else {
      successMsg.value = '修改成功'
    }
    setTimeout(() => {
      emit('success')
      emit('close')
    }, 1500)
  } catch (e) {
    errorMsg.value = e?.data?.detail || e?.message || '修改失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
}
.card {
  position: relative;
  width: 100%;
  max-width: 400px;
  padding: 24px 32px 32px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.title {
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
.form .field {
  margin-bottom: 20px;
}
.password-row {
  position: relative;
  display: flex;
  align-items: center;
}
.password-row input {
  flex: 1;
  padding-right: 36px;
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #dadce0;
  border-radius: 6px;
  box-sizing: border-box;
}
.pwd-toggle {
  position: absolute;
  right: 8px;
  padding: 4px;
  color: #5f6368;
  background: none;
  border: none;
  cursor: pointer;
}
.form label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #202124;
}
.error-msg {
  margin-bottom: 12px;
  font-size: 14px;
  color: #d93025;
}
.success-msg {
  margin-bottom: 12px;
  font-size: 14px;
  color: #1e8e3e;
}
.actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}
.btn {
  padding: 8px 20px;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
}
.btn.primary {
  color: #fff;
  background: #1a73e8;
  border: none;
}
.btn.primary:hover:not(:disabled) {
  background: #1765cc;
}
.btn.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn.secondary {
  color: #5f6368;
  background: #f1f3f4;
  border: none;
}
.btn.secondary:hover {
  background: #e8eaed;
}
</style>
