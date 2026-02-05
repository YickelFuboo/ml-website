import { API_USER_SERVICE_URL } from '../config/env.js'

const BASE_URL = API_USER_SERVICE_URL

function getToken() {
  return localStorage.getItem('moling_token') || ''
}

export async function request(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(fullUrl, { ...options, headers })
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

export async function requestBlob(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`
  const headers = { ...options.headers }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(fullUrl, { ...options, headers })
  if (!res.ok) {
    const text = await res.text()
    let data = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = { message: text }
    }
    const err = new Error(data?.detail || data?.message || res.statusText || '请求失败')
    err.status = res.status
    err.data = data
    throw err
  }
  return res.blob()
}

export async function requestFormData(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`
  const headers = { ...options.headers }
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(fullUrl, { ...options, headers })
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

export { BASE_URL }
