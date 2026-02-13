import { requestProduct, getProductUserId } from './requestProduct.js'

const PREFIX = '/api/v1/arch'

function archQuery() {
  const uid = getProductUserId()
  return uid ? { user_id: uid } : {}
}

export async function getElementTypes() {
  const res = await requestProduct(`${PREFIX}/element-types`, {}, archQuery())
  return res?.types ?? []
}

export async function getElementsTree(versionId) {
  if (!versionId) return []
  const list = await requestProduct(`${PREFIX}/versions/${encodeURIComponent(versionId)}/elements/tree`, {}, archQuery())
  return Array.isArray(list) ? list : []
}

export async function getElement(elementId) {
  const res = await requestProduct(`${PREFIX}/elements/${encodeURIComponent(elementId)}`, {}, archQuery())
  return res
}

export async function createElement(data) {
  const res = await requestProduct(`${PREFIX}/elements`, {
    method: 'POST',
    body: JSON.stringify(data),
  }, archQuery())
  return res
}

export async function updateElement(elementId, data) {
  const res = await requestProduct(`${PREFIX}/elements/${encodeURIComponent(elementId)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, archQuery())
  return res
}

export async function deleteElement(elementId) {
  await requestProduct(`${PREFIX}/elements/${encodeURIComponent(elementId)}`, {
    method: 'DELETE',
  }, archQuery())
}

export async function getVersionArchDoc(versionId) {
  if (!versionId) return ''
  const data = await requestProduct(`${PREFIX}/versions/${encodeURIComponent(versionId)}/doc`, {}, archQuery())
  return typeof data === 'string' ? data : ''
}

export async function getInterfaceCategories() {
  const res = await requestProduct(`${PREFIX}/interface-categories`, {}, archQuery())
  return res?.categories ?? []
}

export async function getPhysicalInterfaceTypes() {
  const res = await requestProduct(`${PREFIX}/physical-interface-types`, {}, archQuery())
  return res?.types ?? []
}

export async function getElementInterfaceRelationTypes() {
  const res = await requestProduct(`${PREFIX}/element-interface-relation-types`, {}, archQuery())
  return res?.types ?? []
}

export async function listInterfaces(versionId, params = {}) {
  if (!versionId) return []
  const q = { ...archQuery(), ...params }
  const list = await requestProduct(`${PREFIX}/versions/${encodeURIComponent(versionId)}/interfaces`, {}, q)
  return Array.isArray(list) ? list : []
}

export async function getInterface(interfaceId) {
  const res = await requestProduct(`${PREFIX}/interfaces/${encodeURIComponent(interfaceId)}`, {}, archQuery())
  return res
}

export async function createInterface(data) {
  const res = await requestProduct(`${PREFIX}/interfaces`, {
    method: 'POST',
    body: JSON.stringify(data),
  }, archQuery())
  return res
}

export async function listElementInterfaces(versionId, params = {}) {
  if (!versionId) return []
  const q = { ...archQuery(), ...params }
  const list = await requestProduct(`${PREFIX}/versions/${encodeURIComponent(versionId)}/element-interfaces`, {}, q)
  return Array.isArray(list) ? list : []
}

export async function createElementInterface(data) {
  const res = await requestProduct(`${PREFIX}/element-interfaces`, {
    method: 'POST',
    body: JSON.stringify(data),
  }, archQuery())
  return res
}

export async function deleteElementInterface(elemIfaceId) {
  await requestProduct(`${PREFIX}/element-interfaces/${encodeURIComponent(elemIfaceId)}`, {
    method: 'DELETE',
  }, archQuery())
}

export async function getBuildArtifactTypes() {
  const res = await requestProduct(`${PREFIX}/build-artifact-types`, {}, archQuery())
  return res?.types ?? []
}

export async function listBuildArtifacts(versionId, params = {}) {
  if (!versionId) return []
  const q = { ...archQuery(), ...params }
  const list = await requestProduct(`${PREFIX}/versions/${encodeURIComponent(versionId)}/build-artifacts`, {}, q)
  return Array.isArray(list) ? list : []
}

export async function listBuildArtifactsTree(versionId) {
  if (!versionId) return []
  const list = await requestProduct(`${PREFIX}/versions/${encodeURIComponent(versionId)}/build-artifacts/tree`, {}, archQuery())
  return Array.isArray(list) ? list : []
}

export async function getBuildArtifact(artifactId) {
  const res = await requestProduct(`${PREFIX}/build-artifacts/${encodeURIComponent(artifactId)}`, {}, archQuery())
  return res
}

export async function createBuildArtifact(data) {
  const res = await requestProduct(`${PREFIX}/build-artifacts`, {
    method: 'POST',
    body: JSON.stringify(data),
  }, archQuery())
  return res
}

export async function updateBuildArtifact(artifactId, data) {
  const res = await requestProduct(`${PREFIX}/build-artifacts/${encodeURIComponent(artifactId)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, archQuery())
  return res
}

export async function deleteBuildArtifact(artifactId) {
  await requestProduct(`${PREFIX}/build-artifacts/${encodeURIComponent(artifactId)}`, {
    method: 'DELETE',
  }, archQuery())
}

export async function listElementToArtifacts(versionId, params = {}) {
  if (!versionId) return []
  const q = { ...archQuery(), ...params }
  const list = await requestProduct(`${PREFIX}/versions/${encodeURIComponent(versionId)}/element-to-artifacts`, {}, q)
  return Array.isArray(list) ? list : []
}

export async function createElementToArtifact(data) {
  const res = await requestProduct(`${PREFIX}/element-to-artifacts`, {
    method: 'POST',
    body: JSON.stringify(data),
  }, archQuery())
  return res
}

export async function updateElementToArtifact(elementArtifactId, data) {
  const res = await requestProduct(`${PREFIX}/element-to-artifacts/${encodeURIComponent(elementArtifactId)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, archQuery())
  return res
}

export async function deleteElementToArtifact(elementArtifactId) {
  await requestProduct(`${PREFIX}/element-to-artifacts/${encodeURIComponent(elementArtifactId)}`, {
    method: 'DELETE',
  }, archQuery())
}

export async function listArtifactToArtifacts(versionId, params = {}) {
  if (!versionId) return []
  const q = { ...archQuery(), ...params }
  const list = await requestProduct(`${PREFIX}/versions/${encodeURIComponent(versionId)}/artifact-to-artifacts`, {}, q)
  return Array.isArray(list) ? list : []
}

export async function createArtifactToArtifact(data) {
  const res = await requestProduct(`${PREFIX}/artifact-to-artifacts`, {
    method: 'POST',
    body: JSON.stringify(data),
  }, archQuery())
  return res
}

export async function updateArtifactToArtifact(artifactToArtifactId, data) {
  const res = await requestProduct(`${PREFIX}/artifact-to-artifacts/${encodeURIComponent(artifactToArtifactId)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, archQuery())
  return res
}

export async function deleteArtifactToArtifact(artifactToArtifactId) {
  await requestProduct(`${PREFIX}/artifact-to-artifacts/${encodeURIComponent(artifactToArtifactId)}`, {
    method: 'DELETE',
  }, archQuery())
}

export async function getDeploymentUnitTypes() {
  const res = await requestProduct(`${PREFIX}/deployment-unit-types`, {}, archQuery())
  return res?.types ?? []
}

export async function listDeploymentUnits(versionId, params = {}) {
  if (!versionId) return []
  const q = { ...archQuery(), ...params }
  const list = await requestProduct(`${PREFIX}/versions/${encodeURIComponent(versionId)}/deployment-units`, {}, q)
  return Array.isArray(list) ? list : []
}

export async function listDeploymentUnitsTree(versionId) {
  if (!versionId) return []
  const list = await listDeploymentUnits(versionId)
  const unitMap = new Map(list.map((u) => [u.id, { ...u, children: [] }]))
  const roots = []
  list.forEach((unit) => {
    const node = unitMap.get(unit.id)
    if (unit.parent_unit_id && unitMap.has(unit.parent_unit_id)) {
      unitMap.get(unit.parent_unit_id).children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

export async function getDeploymentUnit(unitId) {
  const res = await requestProduct(`${PREFIX}/deployment-units/${encodeURIComponent(unitId)}`, {}, archQuery())
  return res
}

export async function createDeploymentUnit(data) {
  const res = await requestProduct(`${PREFIX}/deployment-units`, {
    method: 'POST',
    body: JSON.stringify(data),
  }, archQuery())
  return res
}

export async function updateDeploymentUnit(versionId, unitId, data) {
  const res = await requestProduct(`${PREFIX}/deployment-units/${encodeURIComponent(unitId)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, archQuery())
  return res
}

export async function deleteDeploymentUnit(unitId) {
  await requestProduct(`${PREFIX}/deployment-units/${encodeURIComponent(unitId)}`, {
    method: 'DELETE',
  }, archQuery())
}

export async function listArtifactToDeployments(versionId, params = {}) {
  if (!versionId) return []
  const q = { ...archQuery(), ...params }
  const list = await requestProduct(`${PREFIX}/versions/${encodeURIComponent(versionId)}/artifact-to-deployments`, {}, q)
  return Array.isArray(list) ? list : []
}

export async function createArtifactToDeployment(data) {
  const res = await requestProduct(`${PREFIX}/artifact-to-deployments`, {
    method: 'POST',
    body: JSON.stringify(data),
  }, archQuery())
  return res
}

export async function updateArtifactToDeployment(artifactDeployId, data) {
  const res = await requestProduct(`${PREFIX}/artifact-to-deployments/${encodeURIComponent(artifactDeployId)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, archQuery())
  return res
}

export async function deleteArtifactToDeployment(artifactDeployId) {
  await requestProduct(`${PREFIX}/artifact-to-deployments/${encodeURIComponent(artifactDeployId)}`, {
    method: 'DELETE',
  }, archQuery())
}
