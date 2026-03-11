/**
 * 环境配置：按后台微服务区分，从环境变量读取
 * 开发/测试：.env.development 或 .env
 * 生产：.env.production 或构建时注入
 *
 * 所有服务地址均从 .env 中读取，不携带硬编码 IP 和端口
 */

/** 用户管理服务（认证、用户、OAuth、语言等） */
export const API_USER_SERVICE_URL = (() => {
  const v = import.meta.env.VITE_API_USER_SERVICE_URL
  return (v !== undefined && v !== '') ? v : ''
})()

/** 产品管理服务（产品与版本） */
export const API_PRODUCT_SERVICE_URL = (() => {
  const v = import.meta.env.VITE_API_PRODUCT_SERVICE_URL
  return (v !== undefined && v !== '') ? v : ''
})()

/** 知识库原子服务（知识库与文档） */
export const API_KNOWLEDGEBASE_SERVICE_URL = (() => {
  const v = import.meta.env.VITE_API_KNOWLEDGEBASE_SERVICE_URL
  return (v !== undefined && v !== '') ? v : ''
})()

/** AIAgent Worker 服务（智能助手） */
export const API_AGENT_WORKER_SERVICE_URL = (() => {
  const v = import.meta.env.VITE_API_AGENT_WORKER_SERVICE_URL
  return (v !== undefined && v !== '') ? v : ''
})()

/** @deprecated 请使用 API_USER_SERVICE_URL */
export const API_BASE_URL = API_USER_SERVICE_URL

export const isDevelopment = import.meta.env.DEV
