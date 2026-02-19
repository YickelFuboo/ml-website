import { requestKnowledge, getKnowledgeUserId } from './requestKnowledge.js'

const PREFIX = '/api/v1/qa'

function query(extra = {}) {
  const uid = getKnowledgeUserId()
  const q = uid ? { user_id: uid } : {}
  return { ...q, ...extra }
}

export async function kbQuery(tenantId, body) {
  const res = await requestKnowledge(`${PREFIX}/kb-query`, {
    method: 'POST',
    body: JSON.stringify(body),
  }, query({ tenant_id: tenantId }))
  return res
}

export function kbQueryStreamUrl(tenantId) {
  const base = import.meta.env.VITE_API_KNOWLEDGEBASE_SERVICE_URL || ''
  const path = `${base}${PREFIX}/kb-query/stream`
  const uid = typeof localStorage !== 'undefined' ? localStorage.getItem('moling_user_id') || '' : ''
  const params = new URLSearchParams({ tenant_id: tenantId })
  if (uid) params.set('user_id', uid)
  return `${path}?${params.toString()}`
}
