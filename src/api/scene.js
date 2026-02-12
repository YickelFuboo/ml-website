import { requestProduct, getProductUserId } from './requestProduct.js'

const PREFIX = '/api/v1/scenes'

function sceneQuery() {
  const uid = getProductUserId()
  return uid ? { user_id: uid } : {}
}

export async function getFlowTypes() {
  const res = await requestProduct(`${PREFIX}/flow-types`, {}, sceneQuery())
  return res?.types ?? []
}

export async function listScenesTree(versionId) {
  if (!versionId) return []
  const list = await requestProduct(`${PREFIX}/versions/${encodeURIComponent(versionId)}/tree`, {}, sceneQuery())
  return Array.isArray(list) ? list : []
}

export async function getScene(sceneId) {
  const res = await requestProduct(`${PREFIX}/${encodeURIComponent(sceneId)}`, {}, sceneQuery())
  return res
}

export async function createScene(data) {
  const res = await requestProduct(`${PREFIX}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }, sceneQuery())
  return res
}

export async function updateScene(sceneId, data) {
  const res = await requestProduct(`${PREFIX}/${encodeURIComponent(sceneId)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, sceneQuery())
  return res
}

export async function deleteScene(sceneId) {
  await requestProduct(`${PREFIX}/${encodeURIComponent(sceneId)}`, {
    method: 'DELETE',
  }, sceneQuery())
}

export async function listSceneFlows(sceneId, params = {}) {
  if (!sceneId) return []
  const q = { ...sceneQuery(), ...params }
  const list = await requestProduct(`${PREFIX}/${encodeURIComponent(sceneId)}/flows`, {}, q)
  return Array.isArray(list) ? list : []
}

export async function getSceneFlow(flowId) {
  const res = await requestProduct(`${PREFIX}/flows/${encodeURIComponent(flowId)}`, {}, sceneQuery())
  return res
}

export async function createSceneFlow(sceneId, data) {
  const res = await requestProduct(`${PREFIX}/${encodeURIComponent(sceneId)}/flows`, {
    method: 'POST',
    body: JSON.stringify(data),
  }, sceneQuery())
  return res
}

export async function updateSceneFlow(flowId, data) {
  const res = await requestProduct(`${PREFIX}/flows/${encodeURIComponent(flowId)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, sceneQuery())
  return res
}

export async function deleteSceneFlow(flowId) {
  await requestProduct(`${PREFIX}/flows/${encodeURIComponent(flowId)}`, {
    method: 'DELETE',
  }, sceneQuery())
}
