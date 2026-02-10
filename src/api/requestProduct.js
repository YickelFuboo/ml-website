import { API_PRODUCT_SERVICE_URL } from '../config/env.js'

const BASE_URL = API_PRODUCT_SERVICE_URL

function getToken() {
  return localStorage.getItem('moling_token') || ''
}

function getUserId() {
  return localStorage.getItem('moling_user_id') || ''
}

function buildUrl(path, params = {}) {
  const url = new URL(path.startsWith('http') ? path : `${BASE_URL}${path}`)
  const uid = params.user_id ?? getUserId()
  if (uid) url.searchParams.set('user_id', uid)
  Object.keys(params).forEach((k) => {
    if (k === 'user_id') return
    if (params[k] != null && params[k] !== '') url.searchParams.set(k, params[k])
  })
  return url.toString()
}

export function isProductNeedLoginError(e) {
  return e && (e.needLogin === true || e?.message === '请先登录')
}

export function isProductLoggedIn() {
  const token = getToken()
  const uid = getUserId()
  return !!(token && uid)
}

export async function requestProduct(path, options = {}, queryParams = {}) {
  const token = getToken()
  const uid = getUserId()
  if (!token || !uid) {
    const err = new Error('请先登录')
    err.needLogin = true
    throw err
  }
  const url = buildUrl(path, queryParams)
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(url, { ...options, headers })
  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }
  if (!res.ok) {
    const err = new Error(data?.detail || data?.message || res.statusText || '请求失败')
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export { BASE_URL as PRODUCT_BASE_URL, getUserId as getProductUserId }
