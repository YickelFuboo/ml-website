import { API_AGENT_WORKER_SERVICE_URL } from '../config/env.js'

const BASE_URL = API_AGENT_WORKER_SERVICE_URL

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

export async function requestAgentWorker(path, options = {}, queryParams = {}) {
  const token = getToken()
  const uid = getUserId()
  if (!token || !uid) {
    const err = new Error('请先登录')
    err.needLogin = true
    throw err
  }
  const url = buildUrl(path, queryParams)
  const isFormData = options.body instanceof FormData
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const method = (options.method || 'GET').toUpperCase()
  const body = options.body !== undefined ? options.body : (method === 'POST' || method === 'PUT' && !isFormData ? '{}' : undefined)
  const res = await fetch(url, { ...options, headers, body })
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
    const err = new Error(data?.detail?.message || data?.message || res.statusText || '请求失败')
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export function getAgentWorkerWsBase() {
  const base = API_AGENT_WORKER_SERVICE_URL
  if (!base) return ''
  const u = base.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://')
  return u.endsWith('/') ? u.slice(0, -1) : u
}
