import { ref, computed, onMounted } from 'vue'
import {
  getCurrentUser,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  loginByEmailCode as apiLoginByEmailCode,
  loginByPhoneCode as apiLoginByPhoneCode,
  registerByEmailCode as apiRegisterByEmailCode,
  registerByPhoneCode as apiRegisterByPhoneCode,
  updateCurrentUser,
} from '../api/user.js'

const token = ref(localStorage.getItem('moling_token') || '')
const user = ref(null)

export function useAuth() {
  const isLoggedIn = computed(() => !!token.value && !!user.value)

  function setToken(t) {
    token.value = t || ''
    if (t) {
      localStorage.setItem('moling_token', t)
    } else {
      localStorage.removeItem('moling_token')
      user.value = null
    }
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      user.value = await getCurrentUser()
    } catch {
      setToken('')
    }
  }

  async function login(credentials) {
    const res = await apiLogin(credentials)
    const t = res.access_token ?? res.token ?? res.data?.access_token ?? res.data?.token
    if (!t) throw new Error('登录返回中未找到 token')
    setToken(t)
    await fetchUser()
  }

  async function register(data) {
    const res = await apiRegister(data)
    const t = res.access_token ?? res.token ?? res.data?.access_token ?? res.data?.token
    if (t) {
      setToken(t)
      await fetchUser()
    }
    return res
  }

  async function loginByEmailCode(email, code) {
    const res = await apiLoginByEmailCode(email, code)
    const t = res.access_token ?? res.token ?? res.data?.access_token ?? res.data?.token
    if (!t) throw new Error('登录返回中未找到 token')
    setToken(t)
    await fetchUser()
  }

  async function loginByPhoneCode(phone, code) {
    const res = await apiLoginByPhoneCode(phone, code)
    const t = res.access_token ?? res.token ?? res.data?.access_token ?? res.data?.token
    if (!t) throw new Error('登录返回中未找到 token')
    setToken(t)
    await fetchUser()
  }

  async function registerByEmailCode(body) {
    const res = await apiRegisterByEmailCode(body)
    const t = res.access_token ?? res.token ?? res.data?.access_token ?? res.data?.token
    if (t) {
      setToken(t)
      await fetchUser()
    }
    return res
  }

  async function registerByPhoneCode(body) {
    const res = await apiRegisterByPhoneCode(body)
    const t = res.access_token ?? res.token ?? res.data?.access_token ?? res.data?.token
    if (t) {
      setToken(t)
      await fetchUser()
    }
    return res
  }

  async function logout() {
    try {
      await apiLogout()
    } finally {
      setToken('')
    }
  }

  async function updateUser(body) {
    user.value = await updateCurrentUser(body)
  }

  onMounted(() => {
    if (token.value && !user.value) fetchUser()
  })

  return {
    token,
    user,
    isLoggedIn,
    login,
    register,
    loginByEmailCode,
    loginByPhoneCode,
    registerByEmailCode,
    registerByPhoneCode,
    logout,
    fetchUser,
    updateUser,
    setToken,
  }
}
