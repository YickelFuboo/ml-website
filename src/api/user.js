import { request, requestFormData, requestBlob, BASE_URL } from './request.js'
import { users as usersPaths, auth as authPaths, oauth as oauthPaths } from './paths.js'

/** 一、用户管理（对应后台「用户管理」模块，路径带 user_id） */
export function getCurrentUser(userId) {
  return request(usersPaths.byId(userId))
}

export function updateCurrentUser(userId, body) {
  const apiBody = {}
  if (body.user_name !== undefined) apiBody.user_name = body.user_name
  else if (body.username !== undefined) apiBody.user_name = body.username
  if (body.email !== undefined) apiBody.email = body.email
  if (body.phone !== undefined) apiBody.phone = body.phone
  if (body.user_full_name !== undefined) apiBody.user_full_name = body.user_full_name
  else if (body.description !== undefined) apiBody.user_full_name = body.description
  if (body.avatar !== undefined) apiBody.avatar = body.avatar
  if (body.is_active !== undefined) apiBody.is_active = body.is_active
  if (body.email_verification_code !== undefined) apiBody.email_verification_code = body.email_verification_code
  if (body.phone_verification_code !== undefined) apiBody.phone_verification_code = body.phone_verification_code
  return request(usersPaths.byId(userId), {
    method: 'PUT',
    body: JSON.stringify(apiBody),
  })
}

export function deleteUser(userId) {
  return request(usersPaths.byId(userId), { method: 'DELETE' })
}

export function getAvatarUrl(userId) {
  if (!userId) return ''
  const base = BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  const path = usersPaths.avatar(userId)
  return path.startsWith('http') ? path : `${base}${path}`
}

export function getAvatarBlob(userId) {
  if (!userId) return Promise.reject(new Error('userId required'))
  const path = usersPaths.avatar(userId)
  const url = `${path}?user_id=${encodeURIComponent(userId)}`
  return requestBlob(url)
}

export function changePassword(body, userId, token) {
  const path = usersPaths.changePassword
  const url = userId ? `${path}?user_id=${encodeURIComponent(userId)}` : path
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  return request(url, {
    method: 'POST',
    body: JSON.stringify({
      old_password: body.old_password ?? body.current_password,
      new_password: body.new_password,
    }),
    headers,
  })
}

export function uploadAvatar(file, userId, token) {
  const form = new FormData()
  form.append('file', file)
  const path = usersPaths.uploadAvatar
  const url = userId ? `${path}?user_id=${encodeURIComponent(userId)}` : path
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  return requestFormData(url, {
    method: 'POST',
    body: form,
    headers,
  })
}

/** 二、认证管理（对应后台「认证管理」模块） */
export function login(body) {
  return request(authPaths.loginPassword, {
    method: 'POST',
    body: JSON.stringify({
      user_name: body.user_name ?? body.username,
      password: body.password,
    }),
  })
}

export function logout(userId) {
  const url = userId
    ? `${authPaths.logout}?user_id=${encodeURIComponent(userId)}`
    : authPaths.logout
  return request(url, { method: 'POST' })
}

export function loginByEmailCode(email, code) {
  return request(authPaths.loginEmailCode, {
    method: 'POST',
    body: JSON.stringify({ email, verification_code: code }),
  })
}

export function loginByPhoneCode(phone, code) {
  return request(authPaths.loginPhoneCode, {
    method: 'POST',
    body: JSON.stringify({ phone, verification_code: code }),
  })
}

export function refreshToken(refreshTokenValue) {
  const token = typeof refreshTokenValue === 'string'
    ? refreshTokenValue
    : (refreshTokenValue?.refresh_token ?? refreshTokenValue?.refreshToken)
  return request(authPaths.refresh, {
    method: 'POST',
    body: JSON.stringify({ refresh_token: token }),
  })
}

export function sendVerificationCode(body) {
  const identifier = body.identifier ?? body.email ?? body.phone
  const codeType = body.code_type ?? (body.email != null ? 'email' : 'sms')
  return request(authPaths.sendVerificationCode, {
    method: 'POST',
    body: JSON.stringify({ identifier, code_type: codeType }),
  })
}

export function sendEmailCode(email) {
  return sendVerificationCode({ identifier: email, code_type: 'email' })
}

export function sendSmsCode(phone) {
  return sendVerificationCode({ identifier: phone, code_type: 'sms' })
}

/** 三、用户注册（对应后台「用户管理」注册接口） */
export function register(body) {
  return request(usersPaths.registerPassword, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function registerByEmailCode(body) {
  return request(usersPaths.registerEmailCode, {
    method: 'POST',
    body: JSON.stringify({
      email: body.email,
      verification_code: body.verification_code ?? body.code,
    }),
  })
}

export function registerByPhoneCode(body) {
  return request(usersPaths.registerPhoneCode, {
    method: 'POST',
    body: JSON.stringify({
      phone: body.phone,
      verification_code: body.verification_code ?? body.code,
    }),
  })
}

/** 四、第三方登录（对应后台「第三方登录」模块） */
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
