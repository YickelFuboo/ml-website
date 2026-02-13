/**
 * 环境配置：按后台微服务区分，从环境变量读取
 * 开发/测试：.env.development 或 .env
 * 生产：.env.production 或构建时注入
 *
 * 后续新增业务服务可在此增加对应变量，如：
 *   VITE_API_NOTEBOOK_SERVICE_URL  笔记本服务
 *   VITE_API_XXX_SERVICE_URL      其他业务服务
 */
const isDev = import.meta.env.DEV

/** 用户管理服务（认证、用户、OAuth、语言等） */
export const API_USER_SERVICE_URL = (() => {
  const v = import.meta.env.VITE_API_USER_SERVICE_URL
  if (v !== undefined && v !== '') return v
  if (isDev) return ''
  return ''
})()

/** 产品管理服务（产品与版本，端口 8002） */
export const API_PRODUCT_SERVICE_URL = (() => {
  const v = import.meta.env.VITE_API_PRODUCT_SERVICE_URL
  if (v !== undefined && v !== '') return v
  if (isDev) return 'http://localhost:8002'
  return ''
})()

/** 知识库原子服务（知识库与文档，端口按实际部署） */
export const API_KNOWLEDGEBASE_SERVICE_URL = (() => {
  const v = import.meta.env.VITE_API_KNOWLEDGEBASE_SERVICE_URL
  if (v !== undefined && v !== '') return v
  if (isDev) return 'http://localhost:8003'
  return ''
})()

/** @deprecated 请使用 API_USER_SERVICE_URL */
export const API_BASE_URL = API_USER_SERVICE_URL

export const isDevelopment = isDev
