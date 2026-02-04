/**
 * 后台微服务 API 路径配置
 * 请根据 http://127.0.0.1:8001/docs 中的接口文档核对并修改，
 * 与以下四个模块的 path 保持一致：
 *   - 用户管理
 *   - 认证管理
 *   - 第三方登录
 *   - 语言管理
 */
const PREFIX = '/api/v1'

/** 一、用户管理 */
export const users = {
  me: `${PREFIX}/users/me`,
  list: `${PREFIX}/users`,
  byId: (id) => `${PREFIX}/users/${id}`,
}

/** 二、认证管理（注册、登录、登出、验证码等） */
export const auth = {
  register: `${PREFIX}/auth/register`,
  login: `${PREFIX}/auth/login`,
  logout: `${PREFIX}/auth/logout`,
  sendEmailCode: `${PREFIX}/auth/send-email-code`,
  sendSmsCode: `${PREFIX}/auth/send-sms-code`,
  loginEmailCode: `${PREFIX}/auth/login/email-code`,
  loginPhoneCode: `${PREFIX}/auth/login/phone-code`,
  registerEmailCode: `${PREFIX}/auth/register/email-code`,
  registerPhoneCode: `${PREFIX}/auth/register/phone-code`,
}

/** 三、第三方登录（OAuth） */
export const oauth = {
  providers: `${PREFIX}/oauth/providers`,
  authorize: (provider) => `${PREFIX}/oauth/${provider}/authorize`,
  callback: (provider) => `${PREFIX}/oauth/${provider}/callback`,
}

/** 四、语言管理 */
export const language = {
  list: `${PREFIX}/languages`,
  current: `${PREFIX}/languages/current`,
  setCurrent: `${PREFIX}/languages/current`,
  messages: (locale) => `${PREFIX}/languages/messages/${locale}`,
}

export const paths = { users, auth, oauth, language }
