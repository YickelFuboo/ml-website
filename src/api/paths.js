/**
 * 后台微服务 API 路径配置
 * 与 API 文档（用户管理 / 认证管理 / 第三方登录）保持一致。
 *
 * 用户管理
 *   POST   /api/v1/users/register/password      用户名+密码注册
 *   POST   /api/v1/users/register/phone-code      手机验证码注册
 *   POST   /api/v1/users/register/email-code      邮箱验证码注册
 *   GET    /api/v1/users/                        用户列表
 *   GET    /api/v1/users/{user_id}               获取用户
 *   PUT    /api/v1/users/{user_id}              更新用户
 *   DELETE /api/v1/users/{user_id}               删除用户
 *   POST   /api/v1/users/change-password         修改密码（当前用户）
 *   POST   /api/v1/users/upload-avatar           上传头像（当前用户）
 *   GET    /api/v1/users/{user_id}/avatar        用户头像
 * 认证管理
 *   POST   /api/v1/auth/login/password           用户名+密码登录
 *   POST   /api/v1/auth/login/phone-code         手机验证码登录
 *   POST   /api/v1/auth/login/email-code         邮箱验证码登录
 *   POST   /api/v1/auth/refresh                 刷新 Token
 *   POST   /api/v1/auth/logout                   登出
 *   POST   /api/v1/auth/send-verification-code   发送验证码（邮箱/手机）
 * 第三方登录
 *   GET    /api/v1/oauth/providers               获取 OAuth 提供商列表
 *   GET    /api/v1/oauth/{provider}/authorize   发起授权
 *   POST   /api/v1/oauth/{provider}/callback     授权回调
 *   POST   /api/v1/oauth/{provider}/bind         绑定 OAuth 账户
 *   DELETE /api/v1/oauth/{provider}/unbind      解绑 OAuth 账户
 *   POST   /api/v1/oauth/oidc/callback          OIDC 回调
 *   GET    /api/v1/oauth/oidc/discover/{issuer} OIDC 发现
 */
const PREFIX = '/api/v1'

/** 一、用户管理 */
export const users = {
  list: `${PREFIX}/users`,
  byId: (id) => `${PREFIX}/users/${id}`,
  avatar: (id) => `${PREFIX}/users/${id}/avatar`,
  registerPassword: `${PREFIX}/users/register/password`,
  registerPhoneCode: `${PREFIX}/users/register/phone-code`,
  registerEmailCode: `${PREFIX}/users/register/email-code`,
  changePassword: `${PREFIX}/users/change-password`,
  uploadAvatar: `${PREFIX}/users/upload-avatar`,
}

/** 二、认证管理 */
export const auth = {
  loginPassword: `${PREFIX}/auth/login/password`,
  loginPhoneCode: `${PREFIX}/auth/login/phone-code`,
  loginEmailCode: `${PREFIX}/auth/login/email-code`,
  refresh: `${PREFIX}/auth/refresh`,
  logout: `${PREFIX}/auth/logout`,
  sendVerificationCode: `${PREFIX}/auth/send-verification-code`,
}

/** 三、第三方登录（OAuth） */
export const oauth = {
  providers: `${PREFIX}/oauth/providers`,
  authorize: (provider) => `${PREFIX}/oauth/${provider}/authorize`,
  callback: (provider) => `${PREFIX}/oauth/${provider}/callback`,
  bind: (provider) => `${PREFIX}/oauth/${provider}/bind`,
  unbind: (provider) => `${PREFIX}/oauth/${provider}/unbind`,
  oidcCallback: `${PREFIX}/oauth/oidc/callback`,
  oidcDiscover: (issuer) => `${PREFIX}/oauth/oidc/discover/${encodeURIComponent(issuer)}`,
}

/** 四、语言管理 */
export const language = {
  list: `${PREFIX}/languages`,
  current: `${PREFIX}/languages/current`,
  setCurrent: `${PREFIX}/languages/current`,
  messages: (locale) => `${PREFIX}/languages/messages/${locale}`,
}

export const paths = { users, auth, oauth, language }
