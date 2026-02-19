import { requestKnowledge, getKnowledgeUserId } from './requestKnowledge.js'
import { API_KNOWLEDGEBASE_SERVICE_URL } from '../config/env.js'

const PREFIX = '/api/v1/chat'

function query(extra = {}) {
  const uid = getKnowledgeUserId()
  const q = uid ? { user_id: uid } : {}
  return { ...q, ...extra }
}

export async function chat(body) {
  const uid = getKnowledgeUserId()
  const res = await requestKnowledge(`${PREFIX}/`, {
    method: 'POST',
    body: JSON.stringify({
      user_id: uid || 'anonymous',
      ...body,
    }),
  }, {})
  return res
}

export async function chatStream(body, onChunk) {
  const uid = getKnowledgeUserId()
  const base = API_KNOWLEDGEBASE_SERVICE_URL || ''
  const url = `${base}${PREFIX}/stream?user_id=${encodeURIComponent(uid || 'anonymous')}`
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('moling_token') || '' : ''
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      user_id: uid || 'anonymous',
      ...body,
    }),
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
          if (onChunk && data.content !== undefined) {
            onChunk(data.content, data)
          }
        } catch (_) {}
      }
    }
  }
}
