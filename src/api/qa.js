import { requestKnowledge, getKnowledgeUserId } from './requestKnowledge.js'
import { API_KNOWLEDGEBASE_SERVICE_URL } from '../config/env.js'

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

export async function kbQueryStream(tenantId, body, onChunk) {
  const base = API_KNOWLEDGEBASE_SERVICE_URL || ''
  const uid = getKnowledgeUserId()
  const url = `${base}${PREFIX}/kb-query/stream?tenant_id=${encodeURIComponent(tenantId)}&user_id=${encodeURIComponent(uid || '')}`
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('moling_token') || '' : ''
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    let data = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = { message: text }
    }
    throw new Error(data?.detail?.message || data?.message || res.statusText || '请求失败')
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6))
          if (onChunk && data.answer !== undefined) {
            onChunk(data.answer, data)
          }
        } catch (_) {}
      }
    }
  }
}
