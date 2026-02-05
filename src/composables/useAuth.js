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
  changePassword as apiChangePassword,
  uploadAvatar as apiUploadAvatar,
  getAvatarBlob,
} from '../api/user.js'

const token = ref(localStorage.getItem('moling_token') || '')
const user = ref(null)
const avatarObjectUrls = ref({})
const USER_ID_KEY = 'moling_user_id'
const REFRESH_TOKEN_KEY = 'moling_refresh_token'

function getStoredUserId() {
  return localStorage.getItem(USER_ID_KEY) || ''
}

function getUserDisplayName(u) {
  if (!u) return ''
  const name =
    u.user_name ??
    u.userName ??
    u.username ??
    u.user_full_name ??
    u.userFullName ??
    u.name ??
    u.display_name ??
    u.email ??
    ''
  return typeof name === 'string' ? String(name).trim() : ''
}

export function useAuth() {
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const userId = computed(() => user.value?.id ?? user.value?.user_id ?? getStoredUserId())
  const userDisplayName = computed(() => {
    const name = getUserDisplayName(user.value)
    return name || '用户'
  })

  function setToken(t, uid = null, refreshTokenValue = null) {
    token.value = t || ''
    if (t) {
      localStorage.setItem('moling_token', t)
      if (uid != null && uid !== '') {
        localStorage.setItem(USER_ID_KEY, String(uid))
      }
      if (refreshTokenValue != null && refreshTokenValue !== '') {
        localStorage.setItem(REFRESH_TOKEN_KEY, String(refreshTokenValue))
      }
    } else {
      localStorage.removeItem('moling_token')
      localStorage.removeItem(USER_ID_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      user.value = null
      Object.values(avatarObjectUrls.value).forEach((url) => URL.revokeObjectURL(url))
      avatarObjectUrls.value = {}
    }
  }

  async function fetchUser() {
    const uid = getStoredUserId()
    if (!token.value || !uid) return
    try {
      const res = await getCurrentUser(uid)
      const u = res?.data ?? res
      user.value = u && typeof u === 'object' ? u : null
      if (user.value?.id != null && String(user.value.id) !== getStoredUserId()) {
        localStorage.setItem(USER_ID_KEY, String(user.value.id))
      }
    } catch {
      setToken('')
    }
  }

  function extractTokenAndUserId(res) {
    const t = res.access_token ?? res.token ?? res.data?.access_token ?? res.data?.token
    const uid = res.user_id ?? res.userId ?? res.data?.user_id ?? res.data?.userId ?? res.user?.id ?? res.user?.user_id
    const rt = res.refresh_token ?? res.data?.refresh_token
    return { token: t, userId: uid != null ? String(uid) : null, refreshToken: rt }
  }

  function applyUserFromResponse(res) {
    const u = res.user ?? res.data?.user
    if (u && typeof u === 'object') {
      user.value = u
      const id = u.id ?? u.user_id
      if (id != null && id !== '') {
        localStorage.setItem(USER_ID_KEY, String(id))
      }
    }
  }

  async function login(credentials) {
    const res = await apiLogin(credentials)
    const { token: t, userId: uid, refreshToken: rt } = extractTokenAndUserId(res)
    if (!t) throw new Error('登录返回中未找到 token')
    setToken(t, uid, rt)
    applyUserFromResponse(res)
    await fetchUser()
  }

  async function register(data) {
    const res = await apiRegister(data)
    const { token: t, userId: uid, refreshToken: rt } = extractTokenAndUserId(res)
    if (t) {
      setToken(t, uid, rt)
      applyUserFromResponse(res)
      await fetchUser()
    }
    return res
  }

  async function loginByEmailCode(email, code) {
    const res = await apiLoginByEmailCode(email, code)
    const { token: t, userId: uid, refreshToken: rt } = extractTokenAndUserId(res)
    if (!t) throw new Error('登录返回中未找到 token')
    setToken(t, uid, rt)
    applyUserFromResponse(res)
    await fetchUser()
  }

  async function loginByPhoneCode(phone, code) {
    const res = await apiLoginByPhoneCode(phone, code)
    const { token: t, userId: uid, refreshToken: rt } = extractTokenAndUserId(res)
    if (!t) throw new Error('登录返回中未找到 token')
    setToken(t, uid, rt)
    applyUserFromResponse(res)
    await fetchUser()
  }

  async function registerByEmailCode(body) {
    const res = await apiRegisterByEmailCode(body)
    const { token: t, userId: uid, refreshToken: rt } = extractTokenAndUserId(res)
    if (t) {
      setToken(t, uid, rt)
      applyUserFromResponse(res)
      await fetchUser()
    }
    return res
  }

  async function registerByPhoneCode(body) {
    const res = await apiRegisterByPhoneCode(body)
    const { token: t, userId: uid, refreshToken: rt } = extractTokenAndUserId(res)
    if (t) {
      setToken(t, uid, rt)
      applyUserFromResponse(res)
      await fetchUser()
    }
    return res
  }

  async function logout() {
    const uid = userId.value || getStoredUserId()
    try {
      await apiLogout(uid)
    } finally {
      setToken('')
    }
  }

  async function updateUser(body) {
    const uid = userId.value || getStoredUserId()
    if (!uid) throw new Error('未登录')
    await updateCurrentUser(uid, body)
    await fetchUser()
  }

  async function changePassword(body) {
    if (!token.value) throw new Error('未登录')
    const uid = userId.value || getStoredUserId()
    await apiChangePassword(body, uid, token.value)
    await fetchUser()
  }

  async function uploadAvatarFile(file) {
    if (!token.value) throw new Error('未登录')
    const uid = userId.value || getStoredUserId()
    const res = await apiUploadAvatar(file, uid, token.value)
    await fetchUser()
    return res
  }

  function loadAvatar(uid) {
    const id = uid || userId.value || getStoredUserId()
    if (!id || avatarObjectUrls.value[id]) return
    getAvatarBlob(id)
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        const old = avatarObjectUrls.value[id]
        if (old) URL.revokeObjectURL(old)
        avatarObjectUrls.value = { ...avatarObjectUrls.value, [id]: url }
      })
      .catch(() => {})
  }

  function avatarUrl(uid) {
    const id = uid || userId.value || getStoredUserId()
    return avatarObjectUrls.value[id] || ''
  }

  function revokeAvatar(uid) {
    const id = uid || userId.value || getStoredUserId()
    const url = avatarObjectUrls.value[id]
    if (url) {
      URL.revokeObjectURL(url)
      const next = { ...avatarObjectUrls.value }
      delete next[id]
      avatarObjectUrls.value = next
    }
  }

  onMounted(() => {
    if (token.value && !user.value) fetchUser()
  })

  return {
    token,
    user,
    userId,
    userDisplayName,
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
    changePassword,
    uploadAvatarFile,
    avatarUrl,
    loadAvatar,
    revokeAvatar,
    avatarObjectUrls,
    setToken,
  }
}
