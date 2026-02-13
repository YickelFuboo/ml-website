import { API_KNOWLEDGEBASE_SERVICE_URL } from '../config/env.js'
import { requestKnowledge, getKnowledgeUserId } from './requestKnowledge.js'

const PREFIX = '/api/v1/documents'
const BASE_URL = API_KNOWLEDGEBASE_SERVICE_URL

function query(extra = {}) {
  const uid = getKnowledgeUserId()
  const q = uid ? { user_id: uid } : {}
  return { ...q, ...extra }
}

export async function listDocumentsByKb(kbId, params = {}) {
  if (!kbId) return { documents: [], total: 0, page: 1, page_size: 20 }
  const q = query({
    page: params.page ?? 1,
    page_size: params.page_size ?? 20,
    keywords: params.keywords ?? undefined,
    order_by: params.order_by ?? 'created_at',
    desc: params.desc !== false,
  })
  const res = await requestKnowledge(`${PREFIX}/kb/${encodeURIComponent(kbId)}/list`, { method: 'GET' }, q)
  return res
}

export async function uploadDocuments(kbId, files) {
  const form = new FormData()
  form.append('kb_id', kbId)
  const fileList = Array.isArray(files) ? files : (files ? [files] : [])
  fileList.forEach((f) => form.append('files', f))
  const uid = getKnowledgeUserId()
  const url = new URL(`${BASE_URL}${PREFIX}/upload`)
  url.searchParams.set('user_id', uid || '')
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('moling_token') || '' : ''
  const headers = { Authorization: token ? `Bearer ${token}` : '' }
  const res = await fetch(url.toString(), { method: 'POST', body: form, headers })
  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }
  if (!res.ok) {
    const err = new Error(data?.detail?.message || data?.message || res.statusText || '上传失败')
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export async function updateDocument(docId, body) {
  const res = await requestKnowledge(`${PREFIX}/${encodeURIComponent(docId)}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  }, query())
  return res
}

export async function parseDocument(docId) {
  const res = await requestKnowledge(`${PREFIX}/${encodeURIComponent(docId)}/parse`, { method: 'POST' }, query())
  return res
}

export async function deleteDocument(docId) {
  await requestKnowledge(`${PREFIX}/${encodeURIComponent(docId)}`, { method: 'DELETE' }, query())
}

export async function getDocumentChunksBatch(docIds, params = {}) {
  const docIdsStr = Array.isArray(docIds) ? docIds.join(',') : String(docIds ?? '')
  const q = query({
    doc_ids: docIdsStr,
    with_vector: params.with_vector ?? false,
    page: params.page ?? 1,
    page_size: params.page_size ?? 20,
  })
  const res = await requestKnowledge(`${PREFIX}/chunks/batch`, { method: 'GET' }, q)
  return res
}
