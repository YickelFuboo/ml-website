import { requestAgentWorker } from './requestAgentWorker.js'

const PREFIX = '/api/v1/sessions'

export async function listSessions(params = {}) {
  const res = await requestAgentWorker(`${PREFIX}/list`, { method: 'GET' }, params)
  return Array.isArray(res) ? res : res?.items ?? []
}

export async function createSession(body) {
  const uid = typeof localStorage !== 'undefined' ? localStorage.getItem('moling_user_id') || 'anonymous' : 'anonymous'
  const res = await requestAgentWorker(`${PREFIX}/create`, {
    method: 'POST',
    body: JSON.stringify({ user_id: uid, ...body }),
  }, {})
  return res
}

export async function getSessionInfo(sessionId) {
  return requestAgentWorker(`${PREFIX}/info/${encodeURIComponent(sessionId)}`, { method: 'GET' }, {})
}

const MODELS_PREFIX = '/api/v1/models'

export async function getChatModels() {
  const res = await requestAgentWorker(`${MODELS_PREFIX}/available/chat`, { method: 'GET' }, {})
  return res
}
