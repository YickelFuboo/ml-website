import { requestAgentWorker } from './requestAgentWorker.js'

/** 会话接口对接 AI Worker Session（SessionCreate / SessionInfo / UserMessage） */
const PREFIX = '/api/v1/sessions'

export function getUserId() {
  return typeof localStorage !== 'undefined' ? localStorage.getItem('moling_user_id') || 'anonymous' : 'anonymous'
}

/** 获取会话列表。后端返回 List[SessionInfo]，query: agent_type?, channel_type?, user_id? */
export async function listSessions(params = {}) {
  const q = { user_id: params.user_id ?? getUserId() }
  if (params.agent_type != null && params.agent_type !== '') q.agent_type = params.agent_type
  if (params.channel_type != null && params.channel_type !== '') q.channel_type = params.channel_type
  const res = await requestAgentWorker(`${PREFIX}/list`, { method: 'GET' }, q)
  return Array.isArray(res) ? res : []
}

/** 创建会话。SessionCreate: user_id 必填；agent_type/description/metadata/llm_provider/llm_model 可选。返回 SessionInfo */
export async function createSession(body) {
  const payload = {
    user_id: getUserId(),
    agent_type: body.agent_type ?? null,
    description: body.description ?? null,
    metadata: body.metadata ?? null,
    llm_provider: body.llm_provider ?? null,
    llm_model: body.llm_model ?? null,
  }
  const res = await requestAgentWorker(`${PREFIX}/create`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, {})
  return res
}

/** 获取会话元数据（SessionInfo），不含消息 */
export async function getSessionInfo(sessionId) {
  return requestAgentWorker(`${PREFIX}/info/${encodeURIComponent(sessionId)}`, { method: 'GET' }, {})
}

/** 获取会话消息列表。后端返回 List[UserMessage]（role, content, create_time） */
export async function getSessionMessages(sessionId) {
  const res = await requestAgentWorker(`${PREFIX}/messages/${encodeURIComponent(sessionId)}`, { method: 'GET' }, {})
  return Array.isArray(res) ? res : []
}

/** 删除会话。DELETE /api/v1/sessions/{session_id} */
export async function deleteSession(sessionId) {
  await requestAgentWorker(`${PREFIX}/${encodeURIComponent(sessionId)}`, { method: 'DELETE' }, {})
}

/** 更新会话配置。body: agent_type?, llm_provider?, llm_model?，仅传需修改的字段。返回 SessionInfo */
export async function updateSessionConfig(sessionId, body) {
  const payload = {}
  if (body.agent_type != null) payload.agent_type = body.agent_type
  if (body.llm_provider != null) payload.llm_provider = body.llm_provider
  if (body.llm_model != null) payload.llm_model = body.llm_model
  if (Object.keys(payload).length === 0) return getSessionInfo(sessionId)
  const res = await requestAgentWorker(`${PREFIX}/config/${encodeURIComponent(sessionId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, {})
  return res
}

const MODELS_PREFIX = '/api/v1/models'
const AGENTS_PREFIX = '/api/v1/agents'

export async function getChatModels() {
  const res = await requestAgentWorker(`${MODELS_PREFIX}/available/chat`, { method: 'GET' }, {})
  return res
}

/** 返回 AgentTypesResponse.items：AgentTypeItem[]，每项含 agent_type、name、description */
export async function getAgentTypes() {
  const res = await requestAgentWorker(`${AGENTS_PREFIX}/types`, { method: 'GET' }, {})
  return res?.items ?? []
}
