import { requestKnowledge, getKnowledgeUserId } from './requestKnowledge.js'

const PREFIX = '/api/v1/sessions'

/** 获取会话列表。不传 params 时 requestKnowledge 会带上当前登录 user_id，后端按 user_id 返回该用户的会话。 */
export async function listSessions(params = {}) {
  const res = await requestKnowledge(`${PREFIX}/list`, { method: 'GET' }, params)
  return Array.isArray(res) ? res : res?.items ?? []
}

export async function createSession(body) {
  const uid = getKnowledgeUserId()
  const res = await requestKnowledge(`${PREFIX}/create`, {
    method: 'POST',
    body: JSON.stringify({ user_id: uid || 'anonymous', ...body }),
  }, {})
  return res
}

export async function getSessionInfo(sessionId) {
  return requestKnowledge(`${PREFIX}/info/${encodeURIComponent(sessionId)}`, { method: 'GET' }, {})
}
