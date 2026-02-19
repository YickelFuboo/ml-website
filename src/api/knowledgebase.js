import { requestKnowledge, getKnowledgeUserId } from './requestKnowledge.js'

const PREFIX = '/api/v1/knowledgebase'
const MAX_ITEMS_PER_PAGE = 100

function query(extra = {}) {
  const uid = getKnowledgeUserId()
  const q = uid ? { user_id: uid } : {}
  return { ...q, ...extra }
}

export async function createKb(body) {
  const res = await requestKnowledge(`${PREFIX}/create`, {
    method: 'POST',
    body: JSON.stringify(body),
  }, query())
  return res
}

export async function updateKb(kbId, body) {
  await requestKnowledge(`${PREFIX}/update`, {
    method: 'PUT',
    body: JSON.stringify(body),
  }, query({ kb_id: kbId }))
}

export async function getKbDetail(kbId) {
  const res = await requestKnowledge(`${PREFIX}/detail`, {}, query({ kb_id: kbId }))
  return res
}

export async function listKbsByOwner(params = {}) {
  const raw = params.items_per_page ?? 20
  const itemsPerPage = Math.min(Math.max(1, raw), MAX_ITEMS_PER_PAGE)
  const q = query({
    page_number: params.page_number ?? 1,
    items_per_page: itemsPerPage,
    order_by: params.order_by ?? 'created_at',
    desc: params.desc !== false,
    keywords: params.keywords ?? undefined,
  })
  const res = await requestKnowledge(`${PREFIX}/list-by-owner`, { method: 'GET' }, q)
  return res
}

export async function listKbsByTenant(tenantId, params = {}) {
  const raw = params.items_per_page ?? 100
  const itemsPerPage = Math.min(Math.max(1, raw), MAX_ITEMS_PER_PAGE)
  const q = query({
    tenant_id: tenantId,
    page_number: params.page_number ?? 1,
    items_per_page: itemsPerPage,
    order_by: params.order_by ?? 'created_at',
    desc: params.desc !== false,
    keywords: params.keywords ?? undefined,
  })
  const res = await requestKnowledge(`${PREFIX}/list-by-tenant`, { method: 'GET' }, q)
  return res
}

export async function deleteKb(kbId) {
  await requestKnowledge(`${PREFIX}/delete`, { method: 'DELETE' }, query({ kb_id: kbId }))
}

export async function getParserConfigTemplate() {
  const res = await requestKnowledge(`${PREFIX}/parser-config-template`, { method: 'GET' }, query())
  return res
}

export async function updateKbParserConfig(kbId, body) {
  const res = await requestKnowledge(`${PREFIX}/${kbId}/parser-config`, {
    method: 'PUT',
    body: JSON.stringify(body),
  }, query())
  return res
}

export async function getEmbeddingModels() {
  const res = await requestKnowledge('/api/v1/models/available/embedding', { method: 'GET' }, query())
  return res
}

export async function getRerankModels() {
  const res = await requestKnowledge('/api/v1/models/available/rerank', { method: 'GET' }, query())
  return res
}

export async function getChatModels() {
  const res = await requestKnowledge('/api/v1/models/available/chat', { method: 'GET' }, query())
  return res
}
