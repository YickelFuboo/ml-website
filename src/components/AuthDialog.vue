<template>
  <div class="auth-overlay" @click.self="emit('close')">
    <div class="auth-card">
      <button type="button" class="close-btn" aria-label="关闭" @click="emit('close')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <h2 class="auth-title">登录 / 注册</h2>
      <div class="method-tabs">
        <button type="button" class="method-tab" :class="{ active: method === 'password' }" @click="method = 'password'">用户名密码</button>
        <button type="button" class="method-tab" :class="{ active: method === 'email_code' }" @click="method = 'email_code'">邮箱验证码</button>
        <button type="button" class="method-tab" :class="{ active: method === 'phone_code' }" @click="method = 'phone_code'">手机验证码</button>
      </div>
      <div class="auth-body">
        <template v-if="method === 'password'">
          <form v-if="passwordSubMode === 'login'" class="auth-form" @submit.prevent="handleLoginPassword">
            <p class="method-hint">使用已注册的用户名和密码登录</p>
            <p v-if="authSuccessMessage" class="success-msg">{{ authSuccessMessage }}</p>
            <div class="field">
              <label for="login-username">用户名或邮箱</label>
              <input id="login-username" v-model="loginForm.username" type="text" autocomplete="username" placeholder="请输入用户名或邮箱" />
            </div>
            <div class="field">
              <label for="login-password">密码</label>
              <div class="password-row">
                <input id="login-password" v-model="loginForm.password" :type="showLoginPwd ? 'text' : 'password'" autocomplete="current-password" placeholder="请输入密码" />
                <button type="button" class="pwd-toggle" :aria-label="showLoginPwd ? '隐藏密码' : '显示密码'" @click="showLoginPwd = !showLoginPwd">
                  <svg v-if="!showLoginPwd" class="pwd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  <svg v-else class="pwd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
            <p v-if="authError" class="error-msg">{{ authError }}</p>
            <button type="submit" class="submit-btn" :disabled="loading">{{ loading ? '登录中…' : '登录' }}</button>
            <p class="toggle-hint">
              <button type="button" class="link-btn" @click="passwordSubMode = 'register'">没有账号？去注册</button>
            </p>
          </form>
          <form v-else class="auth-form" @submit.prevent="handleRegisterPassword">
            <p class="method-hint">注册后使用用户名和密码登录</p>
            <div class="field">
              <label for="reg-username">用户名</label>
              <input id="reg-username" v-model="registerForm.username" type="text" autocomplete="username" placeholder="请输入用户名" />
            </div>
            <div class="field">
              <label for="reg-email">邮箱</label>
              <input id="reg-email" v-model="registerForm.email" type="email" autocomplete="email" placeholder="请输入邮箱" />
            </div>
            <div class="field">
              <label for="reg-password">密码</label>
              <div class="password-row">
                <input id="reg-password" v-model="registerForm.password" :type="showRegPwd ? 'text' : 'password'" autocomplete="new-password" placeholder="请输入密码" />
                <button type="button" class="pwd-toggle" :aria-label="showRegPwd ? '隐藏密码' : '显示密码'" @click="showRegPwd = !showRegPwd">
                  <svg v-if="!showRegPwd" class="pwd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  <svg v-else class="pwd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
            <div class="field">
              <label for="reg-password-confirm">再次输入密码</label>
              <div class="password-row">
                <input id="reg-password-confirm" v-model="registerForm.password_confirm" :type="showRegPwd ? 'text' : 'password'" autocomplete="new-password" placeholder="请再次输入密码" />
                <button type="button" class="pwd-toggle" :aria-label="showRegPwd ? '隐藏密码' : '显示密码'" @click="showRegPwd = !showRegPwd">
                  <svg v-if="!showRegPwd" class="pwd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  <svg v-else class="pwd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
            <p v-if="authError" class="error-msg">{{ authError }}</p>
            <button type="submit" class="submit-btn" :disabled="loading">{{ loading ? '注册中…' : '注册' }}</button>
            <p class="toggle-hint">
              <button type="button" class="link-btn" @click="passwordSubMode = 'login'">已有账号？去登录</button>
            </p>
          </form>
        </template>
        <template v-else-if="method === 'email_code'">
          <form class="auth-form" @submit.prevent="handleEmailCodeSubmit">
            <p class="method-hint">未注册将自动创建账号并登录</p>
            <div class="field">
              <label for="login-email">邮箱</label>
              <input id="login-email" v-model="codeEmailForm.email" type="email" autocomplete="email" placeholder="请输入邮箱" />
            </div>
            <div class="field field-code">
              <label for="login-email-code">验证码</label>
              <div class="code-row">
                <input id="login-email-code" v-model="codeEmailForm.code" type="text" inputmode="numeric" maxlength="6" placeholder="请输入验证码" />
                <button type="button" class="code-btn" :disabled="emailCodeCountdown > 0 || codeSending" @click="sendEmailCode()">
                  {{ emailCodeCountdown > 0 ? `${emailCodeCountdown}s 后重发` : '获取验证码' }}
                </button>
              </div>
            </div>
            <p v-if="authError" class="error-msg">{{ authError }}</p>
            <button type="submit" class="submit-btn" :disabled="loading">{{ loading ? '处理中…' : '登录 / 注册' }}</button>
          </form>
        </template>
        <template v-else>
          <form class="auth-form" @submit.prevent="handlePhoneCodeSubmit">
            <p class="method-hint">未注册将自动创建账号并登录</p>
            <div class="field">
              <label for="login-phone">手机号（国内）</label>
              <div class="phone-row">
                <span class="phone-prefix">+86</span>
                <input id="login-phone" v-model="codePhoneForm.phone" type="tel" inputmode="numeric" maxlength="11" placeholder="请输入手机号" />
              </div>
            </div>
            <div class="field field-code">
              <label for="login-phone-code">验证码</label>
              <div class="code-row">
                <input id="login-phone-code" v-model="codePhoneForm.code" type="text" inputmode="numeric" maxlength="6" placeholder="请输入验证码" />
                <button type="button" class="code-btn" :disabled="smsCodeCountdown > 0 || codeSending" @click="sendSmsCode()">
                  {{ smsCodeCountdown > 0 ? `${smsCodeCountdown}s 后重发` : '获取验证码' }}
                </button>
              </div>
            </div>
            <p v-if="authError" class="error-msg">{{ authError }}</p>
            <button type="submit" class="submit-btn" :disabled="loading">{{ loading ? '处理中…' : '登录 / 注册' }}</button>
          </form>
        </template>
      </div>
      <div v-if="oauthProviders.length" class="oauth-section">
        <div class="oauth-divider"><span>第三方登录</span></div>
        <p class="method-hint oauth-hint">未注册将自动创建账号并登录</p>
        <div class="oauth-btns">
          <button
            v-for="p in oauthProviders"
            :key="p.id || p.provider_id"
            type="button"
            class="oauth-btn"
            :title="p.name || p.display_name || p.id"
            @click="goOAuth(p)"
          >
            <span class="oauth-btn-icon" aria-hidden="true">
              <OAuthIcon :provider="p.id || p.provider_id" :display-name="p.name || p.display_name || p.id" />
            </span>
            <span class="oauth-btn-text">{{ p.name || p.display_name || p.id }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { getOAuthProviders, getOAuthUrl, sendEmailCode as apiSendEmailCode, sendSmsCode as apiSendSmsCode } from '../api/user.js'
import OAuthIcon from './OAuthIcon.vue'

const emit = defineEmits(['close', 'success'])

const {
  login: doLogin,
  register: doRegister,
  loginByEmailCode: doLoginByEmailCode,
  loginByPhoneCode: doLoginByPhoneCode,
  registerByEmailCode: doRegisterByEmailCode,
  registerByPhoneCode: doRegisterByPhoneCode,
} = useAuth()

const method = ref('password')
const passwordSubMode = ref('login')
const loading = ref(false)
const codeSending = ref(false)
const authError = ref('')
const authSuccessMessage = ref('')
const emailCodeCountdown = ref(0)
const smsCodeCountdown = ref(0)
const oauthProviders = ref([])

const showLoginPwd = ref(false)
const showRegPwd = ref(false)
const loginForm = ref({ username: '', password: '' })
const registerForm = ref({ username: '', email: '', password: '', password_confirm: '' })
const codeEmailForm = ref({ email: '', code: '', password: '' })
const codePhoneForm = ref({ phone: '', code: '', password: '' })

let emailCodeTimer = null
let smsCodeTimer = null

onMounted(async () => {
  try {
    const res = await getOAuthProviders()
    const list = Array.isArray(res) ? res : (res?.providers ?? res?.data ?? [])
    oauthProviders.value = Array.isArray(list) ? list : []
  } catch {
    oauthProviders.value = []
  }
})

function goOAuth(provider) {
  const providerId = provider.id || provider.provider_id
  const redirectUri = typeof window !== 'undefined' ? window.location.origin : ''
  const url = provider.authorize_url || getOAuthUrl(providerId, redirectUri)
  if (url) window.location.href = url
}

watch(method, () => { authError.value = ''; authSuccessMessage.value = '' })
watch(passwordSubMode, (mode) => {
  authError.value = ''
  if (mode === 'register') authSuccessMessage.value = ''
})

function startEmailCountdown() {
  emailCodeCountdown.value = 60
  if (emailCodeTimer) clearInterval(emailCodeTimer)
  emailCodeTimer = setInterval(() => {
    emailCodeCountdown.value--
    if (emailCodeCountdown.value <= 0) clearInterval(emailCodeTimer)
  }, 1000)
}

function startSmsCountdown() {
  smsCodeCountdown.value = 60
  if (smsCodeTimer) clearInterval(smsCodeTimer)
  smsCodeTimer = setInterval(() => {
    smsCodeCountdown.value--
    if (smsCodeCountdown.value <= 0) clearInterval(smsCodeTimer)
  }, 1000)
}

async function sendEmailCode() {
  if (!codeEmailForm.value.email?.trim()) {
    authError.value = '请先输入邮箱'
    return
  }
  codeSending.value = true
  authError.value = ''
  try {
    await apiSendEmailCode(codeEmailForm.value.email.trim(), 'login')
    startEmailCountdown()
  } catch (e) {
    authError.value = e?.data?.detail || e?.message || '发送失败'
  } finally {
    codeSending.value = false
  }
}

async function sendSmsCode() {
  if (!codePhoneForm.value.phone?.trim()) {
    authError.value = '请先输入手机号'
    return
  }
  const fullPhone = `+86${codePhoneForm.value.phone.trim()}`
  codeSending.value = true
  authError.value = ''
  try {
    await apiSendSmsCode(fullPhone, 'login')
    startSmsCountdown()
  } catch (e) {
    authError.value = e?.data?.detail || e?.message || '发送失败'
  } finally {
    codeSending.value = false
  }
}

async function handleLoginPassword() {
  authError.value = ''
  const username = loginForm.value.username?.trim() || ''
  const password = loginForm.value.password || ''
  if (!username) {
    authError.value = '请填写用户名或邮箱'
    return
  }
  if (!password) {
    authError.value = '请填写密码'
    return
  }
  loading.value = true
  try {
    await doLogin({ username, password })
    emit('success')
    emit('close')
  } catch (e) {
    authError.value = e?.data?.detail || e?.message || '登录失败'
  } finally {
    loading.value = false
  }
}

function isValidEmail(s) {
  const t = (s || '').trim()
  return t.length > 0 && t.includes('@')
}

async function handleRegisterPassword() {
  authError.value = ''
  const username = registerForm.value.username?.trim() || ''
  const email = registerForm.value.email?.trim() || ''
  const password = registerForm.value.password || ''
  if (!username) {
    authError.value = '请填写用户名'
    return
  }
  if (!email) {
    authError.value = '请填写邮箱'
    return
  }
  if (!isValidEmail(email)) {
    authError.value = '请输入有效的邮箱地址（需包含 @）'
    return
  }
  if (!password) {
    authError.value = '请填写密码'
    return
  }
  const password_confirm = registerForm.value.password_confirm || ''
  if (password !== password_confirm) {
    authError.value = '两次输入的密码不一致'
    return
  }
  loading.value = true
  try {
    await doRegister({
      user_name: username,
      password,
      user_full_name: registerForm.value.user_full_name || '',
      email,
      phone: registerForm.value.phone || '',
    })
    authSuccessMessage.value = '注册成功，请登录'
    loginForm.value.username = username
    loginForm.value.password = ''
    passwordSubMode.value = 'login'
  } catch (e) {
    authError.value = e?.data?.detail || e?.message || '注册失败'
  } finally {
    loading.value = false
  }
}

async function handleEmailCodeSubmit() {
  authError.value = ''
  const email = codeEmailForm.value.email?.trim() || ''
  const code = codeEmailForm.value.code?.trim() || ''
  if (!email) {
    authError.value = '请填写邮箱'
    return
  }
  if (!code) {
    authError.value = '请填写验证码'
    return
  }
  loading.value = true
  try {
    await doLoginByEmailCode(email, code)
    emit('success')
    emit('close')
  } catch (e) {
    const msg = e?.data?.detail || e?.message || ''
    const notFound = e?.status === 404 || /未注册|不存在|not found/i.test(String(msg))
    if (notFound) {
      try {
        await doRegisterByEmailCode({
          email,
          code,
          password: codeEmailForm.value.password?.trim() || undefined,
        })
        await doLoginByEmailCode(email, code)
        emit('success')
        emit('close')
        return
      } catch (e2) {
        authError.value = e2?.data?.detail || e2?.message || '注册失败'
      }
    } else {
      authError.value = msg || '登录失败'
    }
  } finally {
    loading.value = false
  }
}

async function handlePhoneCodeSubmit() {
  authError.value = ''
  const phoneRaw = codePhoneForm.value.phone?.trim() || ''
  const code = codePhoneForm.value.code?.trim() || ''
  if (!phoneRaw) {
    authError.value = '请填写手机号'
    return
  }
  if (!code) {
    authError.value = '请填写验证码'
    return
  }
  const phone = `+86${phoneRaw}`
  loading.value = true
  try {
    await doLoginByPhoneCode(phone, code)
    emit('success')
    emit('close')
  } catch (e) {
    const msg = e?.data?.detail || e?.message || ''
    const notFound = e?.status === 404 || /未注册|不存在|not found/i.test(String(msg))
    if (notFound) {
      try {
        await doRegisterByPhoneCode({
          phone,
          code,
          password: codePhoneForm.value.password?.trim() || undefined,
        })
        await doLoginByPhoneCode(phone, code)
        emit('success')
        emit('close')
        return
      } catch (e2) {
        authError.value = e2?.data?.detail || e2?.message || '注册失败'
      }
    } else {
      authError.value = msg || '登录失败'
    }
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
  max-width: 460px;
  padding: 32px 44px 40px;
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
.auth-title {
  font-size: 18px;
  font-weight: 600;
  color: #202124;
  margin-bottom: 20px;
}
.method-tabs {
  display: flex;
  align-items: stretch;
  margin-bottom: 20px;
  padding: 4px;
  background: #f1f3f4;
  border-radius: 10px;
}
.method-tab {
  flex: 1;
  padding: 10px 12px;
  font-size: 14px;
  color: #5f6368;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s, box-shadow 0.2s;
}
.method-tab:hover {
  color: #202124;
}
.method-tab.active {
  color: #1a73e8;
  font-weight: 500;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.method-hint {
  font-size: 12px;
  color: #5f6368;
  margin-bottom: 16px;
  line-height: 1.4;
}
.method-hint.oauth-hint {
  margin-bottom: 12px;
}
.auth-body {
  margin-bottom: 0;
}
.auth-form .field {
  margin-bottom: 20px;
}
.auth-form .field-code {
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
.phone-row {
  display: flex;
  align-items: center;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
}
.phone-row:focus-within {
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
}
.phone-prefix {
  padding: 0 12px;
  height: 44px;
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #5f6368;
  background: #f8f9fa;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
}
.phone-row input {
  flex: 1;
  border: none;
  border-radius: 0;
}
.phone-row input:focus {
  box-shadow: none;
}
.code-row {
  display: flex;
  gap: 8px;
}
.code-row input {
  flex: 1;
  min-width: 0;
}
.code-btn {
  flex-shrink: 0;
  height: 44px;
  padding: 0 14px;
  font-size: 13px;
  color: #1a73e8;
  background: #fff;
  border: 1px solid rgba(26, 115, 232, 0.5);
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
}
.code-btn:hover:not(:disabled) {
  background: #e8f0fe;
}
.code-btn:disabled {
  color: #9aa0a6;
  border-color: rgba(0, 0, 0, 0.12);
  cursor: not-allowed;
}
.toggle-hint {
  margin-top: 16px;
  text-align: center;
  font-size: 13px;
  color: #5f6368;
}
.link-btn {
  background: none;
  border: none;
  padding: 0;
  font-size: inherit;
  color: #1a73e8;
  cursor: pointer;
  text-decoration: none;
}
.link-btn:hover {
  text-decoration: underline;
}
.error-msg {
  margin: -8px 0 12px;
  font-size: 13px;
  color: #d93025;
}
.success-msg {
  margin: -8px 0 12px;
  font-size: 13px;
  color: #1e8e3e;
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
.oauth-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}
.oauth-divider {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #5f6368;
}
.oauth-btns {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  gap: 10px;
}
.oauth-btn {
  display: inline-flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  min-height: 72px;
  padding: 12px 8px;
  font-size: 13px;
  font-weight: 500;
  color: #3c4043;
  background: #fafafa;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.15s;
}
.oauth-btn:hover {
  background: #fff;
  border-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}
.oauth-btn:active {
  transform: translateY(0);
}
.oauth-btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}
.oauth-btn-icon :deep(.oauth-icon-wrap) {
  width: 32px;
  height: 32px;
}
.oauth-btn:hover .oauth-btn-icon :deep(.oauth-icon-wrap) {
  transform: scale(1.05);
}
.oauth-btn-text {
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  letter-spacing: 0.02em;
}
</style>
