const BASE_URL = 'http://127.0.0.1:8001'

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

export { BASE_URL }
