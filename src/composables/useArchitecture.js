import { computed, ref, watch } from 'vue'

function safeParseJson(text, fallback) {
  if (!text) return fallback
  try {
    return JSON.parse(text)
  } catch {
    return fallback
  }
}

function createId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function getStorageKey(versionId, viewId) {
  const v = versionId || 'no_version'
  const view = viewId || 'logical'
  return `moling_architecture_${v}_${view}`
}

function normalizeNode(raw) {
  return {
    id: String(raw?.id || createId()),
    parentId: raw?.parentId ? String(raw.parentId) : '',
    name: typeof raw?.name === 'string' ? raw.name : '',
    type: typeof raw?.type === 'string' ? raw.type : 'component',
    description: typeof raw?.description === 'string' ? raw.description : '',
    contentMd: typeof raw?.contentMd === 'string' ? raw.contentMd : '',
    updatedAt: typeof raw?.updatedAt === 'number' ? raw.updatedAt : Date.now(),
  }
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

  const storageKey = computed(() =>
    getStorageKey(selectedVersionIdRef?.value || '', currentViewRef?.value || 'logical')
  )

  const tree = computed(() => buildTree(nodes.value))
  const flatNodes = computed(() => flattenTree(tree.value.roots))
  const selectedNode = computed(() => tree.value.byId.get(selectedNodeId.value) || null)

  function load() {
    const payload = safeParseJson(localStorage.getItem(storageKey.value), null)
    const rawNodes = Array.isArray(payload?.nodes) ? payload.nodes : []
    nodes.value = rawNodes.map(normalizeNode)
    doc.value = typeof payload?.doc === 'string' ? payload.doc : ''
    if (selectedNodeId.value && !tree.value.byId.get(selectedNodeId.value)) selectedNodeId.value = ''
  }

  function save() {
    localStorage.setItem(storageKey.value, JSON.stringify({ nodes: nodes.value, doc: doc.value }))
  }

  function requireVersion() {
    return !!(selectedVersionIdRef?.value || '')
  }

  function addNode(parentId = '') {
    if (!requireVersion()) return null
    const n = normalizeNode({
      id: createId(),
      parentId: parentId ? String(parentId) : '',
      name: '新节点',
      type: 'component',
      description: '',
      contentMd: '',
      updatedAt: Date.now(),
    })
    nodes.value = [n, ...nodes.value]
    selectedNodeId.value = n.id
    save()
    return n
  }

  function updateNode(id, patch) {
    const targetId = String(id || '')
    if (!targetId) return
    const idx = nodes.value.findIndex((n) => n.id === targetId)
    if (idx < 0) return
    const next = [...nodes.value]
    next[idx] = normalizeNode({ ...next[idx], ...patch, id: targetId, updatedAt: Date.now() })
    nodes.value = next
    save()
  }

  function collectDescendants(rootId) {
    const ids = new Set()
    const stack = [String(rootId)]
    const childrenByParent = new Map()
    nodes.value.forEach((n) => {
      const pid = n.parentId || ''
      if (!childrenByParent.has(pid)) childrenByParent.set(pid, [])
      childrenByParent.get(pid).push(n.id)
    })
    while (stack.length) {
      const cur = stack.pop()
      if (!cur || ids.has(cur)) continue
      ids.add(cur)
      const kids = childrenByParent.get(cur) || []
      kids.forEach((k) => stack.push(k))
    }
    return ids
  }

  function deleteNode(id) {
    const targetId = String(id || '')
    if (!targetId) return
    const ids = collectDescendants(targetId)
    nodes.value = nodes.value.filter((n) => !ids.has(n.id))
    if (ids.has(selectedNodeId.value)) selectedNodeId.value = ''
    save()
  }

  function setDoc(nextDoc) {
    doc.value = typeof nextDoc === 'string' ? nextDoc : ''
    save()
  }

  function generateDoc(titlePrefix = '') {
    const lines = []
    const viewLabel = currentViewRef?.value || 'logical'
    const versionId = selectedVersionIdRef?.value || ''
    const title = titlePrefix ? `${titlePrefix}（${viewLabel}）` : `架构设计文档（${viewLabel}）`
    lines.push(`# ${title}`)
    if (versionId) lines.push(`> 版本ID：${versionId}`)
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

  watch(
    () => storageKey.value,
    () => load(),
    { immediate: true }
  )

  return {
    nodes,
    doc,
    flatNodes,
    selectedNodeId,
    selectedNode,
    load,
    save,
    addNode,
    updateNode,
    deleteNode,
    setDoc,
    generateDoc,
  }
}

