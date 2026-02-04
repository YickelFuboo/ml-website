import { request } from './request.js'

export function register(body) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function login(body) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function logout() {
  return request('/api/auth/logout', { method: 'POST' })
}

export function getCurrentUser() {
  return request('/api/users/me')
}

export function updateCurrentUser(body) {
  return request('/api/users/me', {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}
