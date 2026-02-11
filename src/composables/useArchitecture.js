import { computed, ref, watch } from 'vue'
import {
  getElementsTree,
  createElement,
  updateElement,
  deleteElement,
  getVersionArchDoc,
} from '../api/architecture.js'

const FRONTEND_TYPES = ['component', 'service', 'data', 'infra', 'other']
const TYPE_TO_BACKEND = {
  component: 'component',
  service: 'service',
  data: 'database',
  infra: 'subsystem',
  other: 'module',
}
const BACKEND_TO_TYPE = {
  component: 'component',
  service: 'service',
  database: 'data',
  subsystem: 'infra',
  module: 'other',
}

function backendToFrontendType(elementType) {
  return BACKEND_TO_TYPE[elementType] ?? 'other'
}

function frontendToBackendType(type) {
  return TYPE_TO_BACKEND[type] ?? 'component'
}

function str(v) {
  return typeof v === 'string' ? v : ''
}

function normInterfaceList(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map((item) => {
    if (item && typeof item === 'object' && (item.name != null || item.path != null || item.interface_name != null)) {
      return {
        name: str(item.name ?? item.interface_name ?? item.path ?? ''),
        path: str(item.path ?? item.api_path ?? ''),
        method: str(item.method ?? item.http_method ?? ''),
        description: str(item.description ?? ''),
      }
    }
    return { name: String(item), path: '', method: '', description: '' }
  })
}

function elementToNode(elem) {
  return {
    id: String(elem?.id ?? ''),
    parentId: elem?.parent_id != null ? String(elem.parent_id) : '',
    name: str(elem?.name),
    type: backendToFrontendType(elem?.element_type),
    code: str(elem?.code),
    codeRepoUrl: str(elem?.code_repo_url),
    codeRepoPath: str(elem?.code_repo_path),
    description: str(elem?.responsibility),
    contentMd: str(elem?.definition),
    techStack: str(elem?.tech_stack),
    qualityAttributes: str(elem?.quality_attributes),
    constraints: str(elem?.constraints),
    specifications: str(elem?.specifications),
    providedInterfaces: normInterfaceList(elem?.provided_interfaces ?? elem?.provided_apis),
    dependentInterfaces: normInterfaceList(elem?.dependent_interfaces ?? elem?.dependent_apis),
    updatedAt: elem?.updated_at ? new Date(elem.updated_at).getTime() : Date.now(),
  }
}

function flattenApiTree(roots) {
  const list = []
  const walk = (node) => {
    if (!node) return
    list.push(elementToNode(node))
    const children = node.children ?? []
    children.forEach(walk)
  }
  ;(roots ?? []).forEach(walk)
  return list
}

function buildTree(items) {
  const byId = new Map()
  const childrenByParent = new Map()
  const nodes = items.map((n) => ({ ...n, children: [] }))
  nodes.forEach((n) => {
    byId.set(n.id, n)
    const pid = n.parentId || ''
    if (!childrenByParent.has(pid)) childrenByParent.set(pid, [])
    childrenByParent.get(pid).push(n)
  })
  nodes.forEach((n) => {
    const children = childrenByParent.get(n.id) || []
    n.children = children
  })
  const roots = childrenByParent.get('') || []
  return { roots, byId }
}

function flattenTree(roots) {
  const out = []
  const walk = (node, depth) => {
    out.push({ node, depth })
    ;(node.children || []).forEach((c) => walk(c, depth + 1))
  }
  roots.forEach((r) => walk(r, 0))
  return out
}

export function useArchitecture(selectedVersionIdRef, currentViewRef) {
  const nodes = ref([])
  const doc = ref('')
  const selectedNodeId = ref('')
  const loading = ref(false)
  const docLoading = ref(false)

  const versionId = computed(() => selectedVersionIdRef?.value ?? '')

  const tree = computed(() => buildTree(nodes.value))
  const flatNodes = computed(() => flattenTree(tree.value.roots))
  const selectedNode = computed(() => tree.value.byId.get(selectedNodeId.value) || null)

  async function load() {
    const v = versionId.value
    if (!v) {
      nodes.value = []
      doc.value = ''
      if (selectedNodeId.value) selectedNodeId.value = ''
      return
    }
    loading.value = true
    try {
      const treeData = await getElementsTree(v)
      nodes.value = flattenApiTree(treeData)
      if (selectedNodeId.value && !tree.value.byId.get(selectedNodeId.value)) {
        selectedNodeId.value = ''
      }
    } catch (e) {
      nodes.value = []
      if (selectedNodeId.value) selectedNodeId.value = ''
    } finally {
      loading.value = false
    }
  }

  function requireVersion() {
    return !!versionId.value
  }

  async function addNode(parentId = '') {
    if (!requireVersion()) return null
    const v = versionId.value
    const payload = {
      version_id: v,
      parent_id: parentId ? String(parentId) : null,
      element_type: frontendToBackendType('component'),
      name: '新节点',
      responsibility: '',
      definition: '',
    }
    const created = await createElement(payload)
    await load()
    selectedNodeId.value = created?.id ?? ''
    return tree.value.byId.get(selectedNodeId.value) || null
  }

  async function updateNode(id, patch) {
    const targetId = String(id ?? '')
    if (!targetId) return
    const backendPatch = {}
    if (patch.name !== undefined) backendPatch.name = patch.name
    if (patch.type !== undefined) backendPatch.element_type = frontendToBackendType(patch.type)
    if (patch.description !== undefined) backendPatch.responsibility = patch.description
    if (patch.contentMd !== undefined) backendPatch.definition = patch.contentMd
    if (patch.parentId !== undefined) backendPatch.parent_id = patch.parentId === '' || patch.parentId == null ? null : String(patch.parentId)
    if (patch.code !== undefined) backendPatch.code = patch.code == null ? null : String(patch.code)
    if (patch.codeRepoUrl !== undefined) backendPatch.code_repo_url = patch.codeRepoUrl == null ? null : String(patch.codeRepoUrl)
    if (patch.codeRepoPath !== undefined) backendPatch.code_repo_path = patch.codeRepoPath == null ? null : String(patch.codeRepoPath)
    if (patch.techStack !== undefined) backendPatch.tech_stack = patch.techStack == null ? null : String(patch.techStack)
    if (patch.qualityAttributes !== undefined) backendPatch.quality_attributes = patch.qualityAttributes == null ? null : String(patch.qualityAttributes)
    if (patch.constraints !== undefined) backendPatch.constraints = patch.constraints == null ? null : String(patch.constraints)
    if (patch.specifications !== undefined) backendPatch.specifications = patch.specifications == null ? null : String(patch.specifications)
    await updateElement(targetId, backendPatch)
    await load()
  }

  async function deleteNode(id) {
    const targetId = String(id ?? '')
    if (!targetId) return
    await deleteElement(targetId)
    if (selectedNodeId.value === targetId) selectedNodeId.value = ''
    await load()
  }

  function setDoc(nextDoc) {
    doc.value = typeof nextDoc === 'string' ? nextDoc : ''
  }

  async function fetchDoc() {
    const v = versionId.value
    if (!v) return ''
    docLoading.value = true
    try {
      const content = await getVersionArchDoc(v)
      doc.value = content
      return content
    } finally {
      docLoading.value = false
    }
  }

  function generateDoc(titlePrefix = '') {
    const viewLabel = currentViewRef?.value || 'logical'
    const v = versionId.value
    const title = titlePrefix ? `${titlePrefix}（${viewLabel}）` : `架构设计文档（${viewLabel}）`
    const lines = []
    lines.push(`# ${title}`)
    if (v) lines.push(`> 版本ID：${v}`)
    lines.push('')
    flatNodes.value.forEach(({ node, depth }) => {
      const level = Math.min(6, depth + 2)
      lines.push(`${'#'.repeat(level)} ${node.name || '未命名节点'}`)
      if (node.description) lines.push(node.description)
      if (node.contentMd) {
        lines.push('')
        lines.push(node.contentMd)
      }
      lines.push('')
    })
    const content = lines.join('\n').replace(/\n{3,}/g, '\n\n')
    setDoc(content)
    return content
  }

  watch(versionId, () => load(), { immediate: true })
  if (currentViewRef) {
    watch(currentViewRef, () => {
      if (versionId.value) {
        load()
      }
    }, { immediate: false })
  }

  return {
    nodes,
    doc,
    loading,
    docLoading,
    flatNodes,
    selectedNodeId,
    selectedNode,
    load,
    addNode,
    updateNode,
    deleteNode,
    setDoc,
    generateDoc,
    fetchDoc,
  }
}

export { FRONTEND_TYPES }
