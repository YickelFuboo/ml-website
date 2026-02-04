import { request, BASE_URL } from './request.js'
import { users as usersPaths, auth as authPaths, oauth as oauthPaths } from './paths.js'

/** 一、用户管理（对应后台「用户管理」模块） */
export function getCurrentUser() {
  return request(usersPaths.me)
}

export function updateCurrentUser(body) {
  return request(usersPaths.me, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

/** 二、认证管理（对应后台「认证管理」模块） */
export function register(body) {
  return request(authPaths.register, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function login(body) {
  return request(authPaths.login, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function logout() {
  return request(authPaths.logout, { method: 'POST' })
}

export function sendEmailCode(email, scene = 'login') {
  return request(authPaths.sendEmailCode, {
    method: 'POST',
    body: JSON.stringify({ email, scene }),
  })
}

export function sendSmsCode(phone, scene = 'login') {
  return request(authPaths.sendSmsCode, {
    method: 'POST',
    body: JSON.stringify({ phone, scene }),
  })
}

export function loginByEmailCode(email, code) {
  return request(authPaths.loginEmailCode, {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  })
}

export function loginByPhoneCode(phone, code) {
  return request(authPaths.loginPhoneCode, {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  })
}

export function registerByEmailCode(body) {
  return request(authPaths.registerEmailCode, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function registerByPhoneCode(body) {
  return request(authPaths.registerPhoneCode, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/** 三、第三方登录（对应后台「第三方登录」模块） */
export function getOAuthProviders() {
  return request(oauthPaths.providers)
}

export function getOAuthUrl(provider, redirectUri) {
  const origin = BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  const path = oauthPaths.authorize(provider)
  const url = new URL(path, origin || 'http://localhost')
  if (redirectUri) url.searchParams.set('redirect_uri', redirectUri)
  return url.toString()
}
