import { requestProduct, getProductUserId } from './requestProduct.js'

const PREFIX = '/api/v1/kb-mgmt'

function query() {
  const uid = getProductUserId()
  return uid ? { user_id: uid } : {}
}

export async function getCategories() {
  const res = await requestProduct(`${PREFIX}/categories`, {}, query())
  return res?.categories ?? []
}

export async function listVersionKbs(versionId) {
  if (!versionId) return { version_id: '', by_category: [] }
  const res = await requestProduct(`${PREFIX}/versions/${encodeURIComponent(versionId)}`, {}, query())
  return res || { version_id: versionId, by_category: [] }
}

export async function addKbToVersion(versionId, data) {
  const res = await requestProduct(`${PREFIX}/versions/${encodeURIComponent(versionId)}/items`, {
    method: 'POST',
    body: JSON.stringify(data),
  }, query())
  return res
}

export async function updateVersionKb(versionId, itemId, data) {
  const res = await requestProduct(`${PREFIX}/versions/${encodeURIComponent(versionId)}/items/${encodeURIComponent(itemId)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, query())
  return res
}

export async function removeKbFromVersion(versionId, itemId) {
  await requestProduct(`${PREFIX}/versions/${encodeURIComponent(versionId)}/items/${encodeURIComponent(itemId)}`, {
    method: 'DELETE',
  }, query())
}

export async function getVersionKbItem(versionId, itemId) {
  const res = await requestProduct(`${PREFIX}/versions/${encodeURIComponent(versionId)}/items/${encodeURIComponent(itemId)}`, {}, query())
  return res
}
