<template>
  <div class="scenario-manage-tab">
    <Teleport to="body">
      <div v-if="showAddFlowDialog" class="add-relation-dialog-mask">
        <div class="add-relation-dialog">
          <div class="add-relation-dialog-head">
            <span class="add-relation-title">{{ editingFlowId ? '编辑场景流程' : '新增场景流程' }}</span>
            <button type="button" class="add-relation-close" aria-label="关闭" @click="showAddFlowDialog = false">×</button>
          </div>
          <div class="field">
            <label>流程类型</label>
            <select v-model="flowForm.flow_type" class="add-relation-select" required>
              <option v-for="opt in FLOW_TYPE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div class="field">
            <label>流程名称</label>
            <input v-model="flowForm.name" type="text" placeholder="必填" />
          </div>
          <div class="field field-md">
            <div class="field-md-header">
              <label>流程内容（MD）</label>
              <button type="button" class="btn-md-toggle" @click="toggleFlowMdPreview">{{ flowMdShowPreview ? '源码' : '效果' }}</button>
            </div>
            <textarea v-if="!flowMdShowPreview" v-model="flowForm.content" class="textarea-md-field" rows="5" placeholder="流程内容（Markdown，包含流程图和说明）" />
            <div v-else class="md-preview" v-html="renderMd(flowForm.content)" />
          </div>
          <div class="field">
            <label>关联架构元素（有序）</label>
            <div class="element-select-list">
              <div v-for="(elemId, idx) in flowForm.element_ids" :key="idx" class="element-select-item">
                <select v-model="flowForm.element_ids[idx]" class="add-relation-select">
                  <option value="">请选择</option>
                  <option v-for="item in elementOptionsForIndex(idx)" :key="item.node.id" :value="item.node.id">{{ item.depth ? '　'.repeat(item.depth) + '└ ' : '' }}{{ item.node.name || '未命名节点' }} ({{ getElementTypeLabel(item.node.type) }})</option>
                </select>
                <button type="button" class="btn-remove" @click="removeElementFromFlow(idx)">删除</button>
              </div>
              <button type="button" class="btn btn-sm" @click="addElementToFlow">添加元素</button>
            </div>
          </div>
          <div class="add-relation-actions">
            <button type="button" class="btn" @click="showAddFlowDialog = false">取消</button>
            <button type="button" class="btn primary" :disabled="!canSubmitFlow" @click="submitFlow">确定</button>
          </div>
        </div>
      </div>
    </Teleport>
    <div v-if="!hasVersion" class="empty-state">请先选择版本</div>
    <div v-else class="panels">
      <div class="panel panel-left">
        <div class="panel-header">
          <div class="panel-header-left">
            <span class="panel-title">场景树</span>
          </div>
          <div class="panel-actions">
            <button type="button" class="btn primary" @click="handleAdd">新增</button>
            <button type="button" class="btn danger" :disabled="!selectedSceneId" @click="handleDelete">删除</button>
          </div>
        </div>
        <div class="panel-body tree">
          <div v-if="scenesTreeLoading" class="placeholder">加载中…</div>
          <div v-else-if="!scenesTreeFlat.length" class="placeholder">暂无场景，请点击「新增」</div>
          <button
            v-for="item in scenesTreeFlat"
            :key="item.scene.id"
            type="button"
            class="tree-node"
            :class="{ active: selectedSceneId === item.scene.id }"
            :style="{ paddingLeft: `${12 + item.depth * 16}px` }"
            @click="selectedSceneId = item.scene.id"
          >
            <span class="node-icon">🎬</span>
            <span class="node-name">{{ item.scene.name || '未命名场景' }}</span>
          </button>
        </div>
      </div>

      <div class="panel panel-center">
        <div class="panel-header">
          <span class="panel-title">场景详情</span>
        </div>
        <div class="panel-body">
          <div v-if="!isAddingScene && !selectedSceneId" class="placeholder">请选择左侧树中的场景</div>
          <div v-else-if="!isAddingScene && selectedSceneId && !selectedScene" class="placeholder">加载中…</div>
          <template v-else>
            <div class="detail-tabs">
              <button type="button" class="detail-tab" :class="{ active: detailTab === 'basic' }" @click="detailTab = 'basic'">基本信息</button>
              <button type="button" class="detail-tab" :class="{ active: detailTab === 'flows' }" @click="detailTab = 'flows'">场景流程</button>
            </div>
            <div v-show="detailTab === 'basic'" class="detail-form">
              <div class="field">
                <label>名称</label>
                <input v-model="sceneDraft.name" type="text" placeholder="场景名称" />
              </div>
              <div class="field">
                <label>父场景</label>
                <select v-model="sceneDraft.parent_id" class="parent-select">
                  <option value="">根（无父场景）</option>
                  <option
                    v-for="item in sceneParentOptions"
                    :key="item.scene.id"
                    :value="item.scene.id"
                  >
                    {{ item.depth ? '　'.repeat(item.depth) + '└ ' : '' }}{{ item.scene.name || '未命名场景' }}
                  </option>
                </select>
              </div>
              <div class="field">
                <label>Actor（场景相关操作人员，每行一个）</label>
                <textarea v-model="sceneActorsText" rows="3" placeholder="每行一个Actor" />
              </div>
              <div class="field field-md">
                <div class="field-md-header">
                  <label>说明（MD）</label>
                  <button type="button" class="btn-md-toggle" @click="toggleSceneMdPreview">{{ sceneMdShowPreview ? '源码' : '效果' }}</button>
                </div>
                <textarea v-if="!sceneMdShowPreview" v-model="sceneDraft.description" class="textarea-md-field" rows="3" placeholder="说明，支持 Markdown" />
                <div v-else class="md-preview" v-html="renderMd(sceneDraft.description)" />
              </div>
              <div class="form-actions">
                <button type="button" class="btn" @click="handleSaveScene">保存</button>
              </div>
            </div>
            <div v-show="detailTab === 'flows'" class="detail-form flows-list">
              <div v-if="flowsLoading" class="interface-loading">加载中…</div>
              <template v-else>
                <div class="interface-section-head">
                  <span class="interface-section-title">场景流程</span>
                  <button type="button" class="btn btn-sm" @click.stop="openAddFlowDialog">添加</button>
                </div>
                <div v-if="!flowsList.length" class="interface-empty">暂无数据</div>
                <ul v-else class="interface-list">
                  <li v-for="flow in flowsList" :key="flow.id" class="interface-item">
                    <div class="interface-item-summary">
                      <span class="interface-name">{{ flow.name || '—' }}</span>
                      <span v-if="flow.flow_type" class="interface-meta">{{ getFlowTypeLabel(flow.flow_type) }}</span>
                      <button type="button" class="btn-expand" @click="toggleFlowExpand(flow.id)">{{ expandedFlowId === flow.id ? '收起' : '详情' }}</button>
                      <button type="button" class="btn-edit" @click="openEditFlowDialog(flow)">编辑</button>
                      <button type="button" class="btn-remove" aria-label="删除" @click="removeFlow(flow.id)">删除</button>
                    </div>
                    <div v-if="expandedFlowId === flow.id" class="interface-item-detail">
                      <div class="interface-detail-row field-md">
                        <div class="field-md-header">
                          <span class="detail-label">流程内容（MD）</span>
                          <button type="button" class="btn-md-toggle" @click="toggleFlowDetailMd(flow.id)">{{ getFlowDetailMdPreview(flow.id) ? '源码' : '效果' }}</button>
                        </div>
                        <template v-if="!getFlowDetailMdPreview(flow.id)">
                          <div class="md-preview small" v-html="renderMd(flow.content)" />
                        </template>
                        <pre v-else class="interface-md-src">{{ flow.content || '—' }}</pre>
                      </div>
                      <div v-if="flow.element_ids && flow.element_ids.length" class="interface-detail-row">
                        <span class="detail-label">关联架构元素</span>
                        <div class="element-list">
                          <span v-for="(elemId, idx) in flow.element_ids" :key="idx" class="element-tag">
                            {{ getElementName(elemId) || elemId }}
                            <span v-if="getElementType(elemId)" class="element-type">{{ getElementTypeLabel(getElementType(elemId)) }}</span>
                          </span>
                        </div>
                      </div>
                      <div v-else class="interface-detail-row">
                        <span class="detail-label">关联架构元素</span>
                        <span class="detail-value">—</span>
                      </div>
                      <div class="interface-detail-row"><span class="detail-label">创建时间</span><span class="detail-value">{{ formatDateTime(flow.created_at) }}</span></div>
                      <div v-if="flow.updated_at" class="interface-detail-row"><span class="detail-label">更新时间</span><span class="detail-value">{{ formatDateTime(flow.updated_at) }}</span></div>
                    </div>
                  </li>
                </ul>
              </template>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { marked } from 'marked'
import { useProductSelection } from '../../composables/useProductSelection.js'
import { getFlowTypes, listScenesTree, getScene, createScene, updateScene, deleteScene, listSceneFlows, createSceneFlow, updateSceneFlow, deleteSceneFlow } from '../../api/scene.js'
import { getElementsTree } from '../../api/architecture.js'
import { isProductNeedLoginError } from '../../api/requestProduct.js'

const { selectedVersionId } = useProductSelection()
const hasVersion = computed(() => !!selectedVersionId.value)

marked.setOptions({ breaks: true })
function renderMd(text) {
  const s = text != null ? String(text).trim() : ''
  if (!s) return '<p class="md-empty">暂无内容</p>'
  return marked.parse(s)
}

function formatDateTime(dt) {
  if (!dt) return '—'
  const d = typeof dt === 'string' ? new Date(dt) : dt
  return d.toLocaleString('zh-CN')
}

const scenesTreeLoading = ref(false)
const scenesTreeFlat = ref([])
const selectedSceneId = ref('')
const selectedScene = ref(null)
const isAddingScene = ref(false)
const detailTab = ref('basic')
const flowsLoading = ref(false)
const flowsList = ref([])
const expandedFlowId = ref(null)
const flowDetailMdPreview = ref({})

const sceneDraft = ref({
  name: '',
  parent_id: '',
  description: '',
})
const sceneActorsText = ref('')
const sceneMdShowPreview = ref(false)

const flowTypes = ref([])
const showAddFlowDialog = ref(false)
const editingFlowId = ref(null)
const flowForm = ref({
  flow_type: '',
  name: '',
  content: '',
  element_ids: [],
})
const flowMdShowPreview = ref(false)

const elementsTreeLoading = ref(false)
const elementsTreeFlat = ref([])
const elementsMap = ref(new Map())

function flattenSceneTree(roots) {
  const result = []
  const walk = (nodes, depth = 0) => {
    nodes.forEach((node) => {
      result.push({ scene: node, depth })
      if (node.children && node.children.length) {
        walk(node.children, depth + 1)
      }
    })
  }
  walk(roots)
  return result
}

function flattenElementsTree(roots) {
  const result = []
  const walk = (nodes, depth = 0) => {
    nodes.forEach((node) => {
      result.push({ node, depth })
      if (node.children && node.children.length) {
        walk(node.children, depth + 1)
      }
    })
  }
  walk(roots)
  return result
}

function getSceneDescendantIds(sceneId) {
  const item = scenesTreeFlat.value.find(({ scene }) => scene.id === sceneId)
  if (!item) return new Set()
  const ids = new Set()
  const walk = (s) => {
    if (s.children && s.children.length) {
      s.children.forEach((c) => {
        ids.add(c.id)
        walk(c)
      })
    }
  }
  walk(item.scene)
  return ids
}

const sceneParentOptions = computed(() => {
  const sid = selectedSceneId.value
  if (!sid) return scenesTreeFlat.value
  const descendantIds = getSceneDescendantIds(sid)
  return scenesTreeFlat.value.filter(({ scene }) => scene.id !== sid && !descendantIds.has(scene.id))
})

const FLOW_TYPE_OPTIONS = [
  { value: 'normal', label: '正常流程' },
  { value: 'exception', label: '异常流程' },
]
const FLOW_TYPE_LABELS = { normal: '正常流程', exception: '异常流程' }
function getFlowTypeLabel(type) {
  return FLOW_TYPE_LABELS[type] || type || '—'
}

function getElementTypeLabel(type) {
  const labels = {
    system: '系统',
    subsystem: '子系统',
    module: '模块',
    component: '组件',
    service: '服务',
    function: '功能',
  }
  return labels[type] || type || '—'
}

function getElementName(elementId) {
  const elem = elementsMap.value.get(elementId)
  return elem?.name || '—'
}

function getElementType(elementId) {
  const elem = elementsMap.value.get(elementId)
  return elem?.type || null
}

async function loadScenesTree() {
  if (!selectedVersionId.value) {
    scenesTreeFlat.value = []
    return
  }
  scenesTreeLoading.value = true
  try {
    const tree = await listScenesTree(selectedVersionId.value)
    const flat = flattenSceneTree(Array.isArray(tree) ? tree : [])
    scenesTreeFlat.value = flat
    if (!flat.length) isAddingScene.value = true
  } catch (e) {
    if (isProductNeedLoginError(e)) {
      alert('请先登录')
    } else {
      console.error('加载场景树失败:', e)
    }
    scenesTreeFlat.value = []
  } finally {
    scenesTreeLoading.value = false
  }
}

async function loadElementsTree() {
  if (!selectedVersionId.value) {
    elementsTreeFlat.value = []
    elementsMap.value.clear()
    return
  }
  elementsTreeLoading.value = true
  try {
    const tree = await getElementsTree(selectedVersionId.value)
    elementsTreeFlat.value = flattenElementsTree(Array.isArray(tree) ? tree : [])
    elementsMap.value = new Map(elementsTreeFlat.value.map(({ node }) => [node.id, node]))
  } catch (e) {
    if (isProductNeedLoginError(e)) {
      alert('请先登录')
    } else {
      console.error('加载架构元素树失败:', e)
    }
    elementsTreeFlat.value = []
    elementsMap.value.clear()
  } finally {
    elementsTreeLoading.value = false
  }
}

async function loadScene() {
  if (!selectedSceneId.value) {
    selectedScene.value = null
    return
  }
  try {
    const scene = await getScene(selectedSceneId.value)
    selectedScene.value = scene
    sceneDraft.value = {
      name: scene.name || '',
      parent_id: scene.parent_id || '',
      description: scene.description || '',
    }
    sceneActorsText.value = Array.isArray(scene.actors) ? scene.actors.join('\n') : ''
  } catch (e) {
    if (isProductNeedLoginError(e)) {
      alert('请先登录')
    } else {
      console.error('加载场景失败:', e)
    }
    selectedScene.value = null
  }
}

async function loadFlows() {
  if (!selectedSceneId.value) {
    flowsList.value = []
    return
  }
  flowsLoading.value = true
  try {
    const flows = await listSceneFlows(selectedSceneId.value)
    flowsList.value = Array.isArray(flows) ? flows : []
  } catch (e) {
    if (isProductNeedLoginError(e)) {
      alert('请先登录')
    } else {
      console.error('加载场景流程失败:', e)
    }
    flowsList.value = []
  } finally {
    flowsLoading.value = false
  }
}

watch(selectedVersionId, () => {
  loadScenesTree()
  loadElementsTree()
  selectedSceneId.value = ''
}, { immediate: true })

watch(selectedSceneId, (id) => {
  if (id) isAddingScene.value = false
  loadScene()
  loadFlows()
  detailTab.value = 'basic'
  expandedFlowId.value = null
})

watch(selectedScene, (scene) => {
  if (!scene) {
    sceneDraft.value = {
      name: '',
      parent_id: '',
      description: '',
    }
    sceneActorsText.value = ''
    return
  }
  sceneDraft.value = {
    name: scene.name || '',
    parent_id: scene.parent_id || '',
    description: scene.description || '',
  }
  sceneActorsText.value = Array.isArray(scene.actors) ? scene.actors.join('\n') : ''
}, { immediate: true })

onMounted(async () => {
  try {
    const types = await getFlowTypes()
    flowTypes.value = Array.isArray(types) ? types : []
  } catch (e) {
    if (isProductNeedLoginError(e)) {
      alert('请先登录')
    } else {
      console.error('加载流程类型失败:', e)
    }
    flowTypes.value = []
  }
})

function handleAdd() {
  isAddingScene.value = true
  selectedSceneId.value = ''
  sceneDraft.value = {
    name: '',
    parent_id: '',
    description: '',
  }
  sceneActorsText.value = ''
  sceneMdShowPreview.value = false
}

async function handleSaveScene() {
  if (!selectedVersionId.value) {
    alert('请先选择版本')
    return
  }
  if (!sceneDraft.value.name?.trim()) {
    alert('请输入场景名称')
    return
  }
  try {
    const actors = sceneActorsText.value.trim() ? sceneActorsText.value.trim().split('\n').filter((s) => s.trim()) : []
    const data = {
      ...sceneDraft.value,
      parent_id: sceneDraft.value.parent_id || null,
      actors: actors.length ? actors : null,
    }
    if (selectedSceneId.value) {
      await updateScene(selectedSceneId.value, data)
      isAddingScene.value = false
    } else {
      const created = await createScene({
        version_id: selectedVersionId.value,
        ...data,
      })
      selectedSceneId.value = created.id
      isAddingScene.value = false
    }
    await loadScenesTree()
    await loadScene()
  } catch (e) {
    if (isProductNeedLoginError(e)) {
      alert('请先登录')
    } else {
      alert('保存失败: ' + (e?.message || String(e)))
    }
  }
}

async function handleDelete() {
  if (!selectedSceneId.value) return
  if (!confirm('确定要删除该场景吗？')) return
  try {
    await deleteScene(selectedSceneId.value)
    selectedSceneId.value = ''
    await loadScenesTree()
    if (!scenesTreeFlat.value.length) isAddingScene.value = true
  } catch (e) {
    if (isProductNeedLoginError(e)) {
      alert('请先登录')
    } else {
      alert('删除失败: ' + (e?.message || String(e)))
    }
  }
}

function toggleSceneMdPreview() {
  sceneMdShowPreview.value = !sceneMdShowPreview.value
}

function toggleFlowMdPreview() {
  flowMdShowPreview.value = !flowMdShowPreview.value
}

function toggleFlowExpand(flowId) {
  expandedFlowId.value = expandedFlowId.value === flowId ? null : flowId
}

function toggleFlowDetailMd(flowId) {
  const key = `flow_${flowId}`
  flowDetailMdPreview.value[key] = !flowDetailMdPreview.value[key]
}

function getFlowDetailMdPreview(flowId) {
  const key = `flow_${flowId}`
  return flowDetailMdPreview.value[key] || false
}

const flatElements = computed(() => elementsTreeFlat.value)

const canSubmitFlow = computed(() => {
  return flowForm.value.flow_type && flowForm.value.name?.trim()
})

function openAddFlowDialog() {
  editingFlowId.value = null
  const defaultType = FLOW_TYPE_OPTIONS[0].value
  flowForm.value = {
    flow_type: defaultType,
    name: '',
    content: '',
    element_ids: [],
  }
  flowMdShowPreview.value = false
  showAddFlowDialog.value = true
}

function openEditFlowDialog(flow) {
  editingFlowId.value = flow.id
  flowForm.value = {
    flow_type: flow.flow_type || '',
    name: flow.name || '',
    content: flow.content || '',
    element_ids: Array.isArray(flow.element_ids) ? [...flow.element_ids] : [],
  }
  flowMdShowPreview.value = false
  showAddFlowDialog.value = true
}

function elementOptionsForIndex(idx) {
  const ids = flowForm.value.element_ids || []
  return flatElements.value.filter((item) => {
    const id = item.node.id
    const selectedAt = ids.indexOf(id)
    return selectedAt === -1 || selectedAt === idx
  })
}

function addElementToFlow() {
  flowForm.value.element_ids.push('')
}

function removeElementFromFlow(idx) {
  flowForm.value.element_ids.splice(idx, 1)
}

async function submitFlow() {
  if (!selectedSceneId.value) {
    alert('请先选择场景')
    return
  }
  if (!selectedVersionId.value) {
    alert('请先选择版本')
    return
  }
  try {
    const data = {
      version_id: selectedVersionId.value,
      flow_type: flowForm.value.flow_type,
      name: flowForm.value.name.trim(),
      content: flowForm.value.content || null,
      element_ids: flowForm.value.element_ids.filter((id) => id),
    }
    if (editingFlowId.value) {
      await updateSceneFlow(editingFlowId.value, data)
    } else {
      await createSceneFlow(selectedSceneId.value, data)
    }
    showAddFlowDialog.value = false
    await loadFlows()
  } catch (e) {
    if (isProductNeedLoginError(e)) {
      alert('请先登录')
    } else {
      alert('保存失败: ' + (e?.message || String(e)))
    }
  }
}

async function removeFlow(flowId) {
  if (!confirm('确定要删除该场景流程吗？')) return
  try {
    await deleteSceneFlow(flowId)
    await loadFlows()
    if (expandedFlowId.value === flowId) {
      expandedFlowId.value = null
    }
  } catch (e) {
    if (isProductNeedLoginError(e)) {
      alert('请先登录')
    } else {
      alert('删除失败: ' + (e?.message || String(e)))
    }
  }
}
</script>

<style scoped>
.scenario-manage-tab { display: flex; flex-direction: column; flex: 1; min-height: 0; }

.btn { padding: 6px 12px; font-size: 13px; border-radius: 6px; cursor: pointer; border: none; }
.btn.primary { color: #fff; background: #1a73e8; }
.btn.primary:hover:not(:disabled) { background: #1765cc; }
.btn.danger { color: #fff; background: #d93025; }
.btn.danger:hover:not(:disabled) { background: #b71c1c; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-sm { padding: 4px 8px; font-size: 12px; }

.empty-state {
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  color: #9aa0a6;
  font-size: 14px;
  text-align: center;
}

.panels {
  display: flex;
  flex: 1;
  min-height: 0;
  gap: 12px;
}

.panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
.panel-left { width: 22%; min-width: 240px; max-width: 320px; }
.panel-center { flex: 1; min-width: 0; }
.panel-header { min-height: 48px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 16px; border-bottom: 1px solid #e8eaed; flex-shrink: 0; }
.panel-title { font-size: 13px; font-weight: 500; color: #5f6368; }
.panel-body { flex: 1; min-height: 0; overflow: auto; }
.placeholder { padding: 16px; font-size: 14px; color: #9aa0a6; }

.panel-header-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
.panel-left .panel-header .panel-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-left: auto;
}
.panel-left .panel-header .btn {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  background: #111;
  color: #fff;
}
.panel-left .panel-header .btn:hover:not(:disabled) { background: #000; }
.panel-left .panel-header .btn.primary { color: #fff; background: #111; }
.panel-left .panel-header .btn.primary:hover:not(:disabled) { background: #000; }
.panel-left .panel-header .btn.danger { color: #fff; background: #111; }
.panel-left .panel-header .btn.danger:hover:not(:disabled) { background: #000; }
.panel-left .panel-header .btn:disabled { opacity: 0.6; cursor: not-allowed; }

.tree { padding: 8px 0; }
.tree-node {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: #202124;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}
.tree-node:hover { background: #f1f3f4; }
.tree-node.active { background: #e8f0fe; color: #1a73e8; }
.node-icon { width: 18px; text-align: center; flex-shrink: 0; }
.node-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.detail-tabs {
  display: flex;
  gap: 0;
  padding: 0 16px;
  border-bottom: 1px solid #e8eaed;
  flex-shrink: 0;
}
.detail-tab {
  padding: 10px 16px;
  font-size: 13px;
  color: #5f6368;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  cursor: pointer;
}
.detail-tab:hover { color: #202124; }
.detail-tab.active {
  color: #1a73e8;
  font-weight: 500;
  border-bottom-color: #1a73e8;
}

.detail-form {
  padding: 16px;
}
.form-actions { margin-top: 8px; display: flex; justify-content: flex-end; gap: 10px; }
.detail-form .form-actions .btn {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  background: #111;
  color: #fff;
}
.detail-form .form-actions .btn:hover:not(:disabled) {
  background: #000;
}
.detail-form .form-actions .btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.field {
  margin-bottom: 16px;
}
.field label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #202124;
}
.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 8px 12px;
  font-size: 13px;
  border: 1px solid #dadce0;
  border-radius: 6px;
  color: #202124;
}
.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: none;
  border-color: #1a73e8;
}
.field textarea {
  resize: vertical;
  font-family: inherit;
}
.parent-select {
  font-size: 13px;
}

.field-md-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.btn-md-toggle {
  padding: 4px 8px;
  font-size: 12px;
  color: #5f6368;
  background: transparent;
  border: 1px solid #dadce0;
  border-radius: 4px;
  cursor: pointer;
}
.btn-md-toggle:hover { background: #f8f9fa; }
.textarea-md-field {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
.md-preview {
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e8eaed;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.6;
  min-height: 60px;
}
.md-preview :deep(h1), .md-preview :deep(h2), .md-preview :deep(h3) { margin-top: 0; margin-bottom: 8px; }
.md-preview :deep(p) { margin: 0 0 8px 0; }
.md-preview :deep(p:last-child) { margin-bottom: 0; }
.md-preview :deep(code) { background: #f1f3f4; padding: 2px 4px; border-radius: 3px; font-size: 12px; }
.md-preview :deep(pre) { background: #f1f3f4; padding: 8px; border-radius: 4px; overflow-x: auto; }
.md-preview :deep(pre code) { background: transparent; padding: 0; }
.md-empty { color: #9aa0a6; font-style: italic; }

.interface-loading { padding: 16px; text-align: center; color: #9aa0a6; }
.interface-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.interface-section-title {
  font-size: 13px;
  font-weight: 500;
  color: #202124;
}
.interface-empty {
  padding: 16px;
  text-align: center;
  color: #9aa0a6;
  font-size: 13px;
}
.interface-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.interface-item {
  padding: 10px 12px;
  font-size: 13px;
  border: 1px solid #e8eaed;
  border-radius: 6px;
  margin-bottom: 8px;
}
.interface-item-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.interface-name { font-weight: 500; color: #202124; }
.interface-meta { font-size: 12px; color: #5f6368; }
.interface-item .btn-expand,
.interface-item .btn-edit {
  padding: 4px 10px;
  font-size: 12px;
  color: #1a73e8;
  background: #e8f0fe;
  border: 1px solid #1a73e8;
  border-radius: 6px;
  cursor: pointer;
}
.interface-item .btn-expand:hover,
.interface-item .btn-edit:hover { background: #d2e3fc; }
.interface-item .btn-remove {
  margin-left: auto;
  padding: 4px 10px;
  font-size: 12px;
  color: #5f6368;
  background: #f1f3f4;
  border: 1px solid #dadce0;
  border-radius: 6px;
  cursor: pointer;
}
.interface-item .btn-remove:hover { background: #ea4335; color: #fff; border-color: #ea4335; }
.interface-item-detail {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e8eaed;
}
.interface-detail-row {
  margin-bottom: 10px;
  font-size: 13px;
}
.interface-detail-row .detail-label {
  display: inline-block;
  min-width: 100px;
  color: #5f6368;
  margin-right: 8px;
  vertical-align: top;
}
.interface-detail-row .detail-value {
  color: #202124;
  word-break: break-word;
}
.interface-detail-row.field-md .field-md-header { margin-bottom: 6px; }
.interface-detail-row.field-md .detail-label { min-width: auto; }
.md-preview.small {
  min-height: 40px;
  padding: 8px 10px;
  font-size: 13px;
  line-height: 1.5;
  background: #f8f9fa;
  border: 1px solid #e8eaed;
  border-radius: 6px;
}
.interface-md-src {
  margin: 0;
  padding: 8px 10px;
  font-size: 12px;
  font-family: ui-monospace, monospace;
  background: #f8f9fa;
  border: 1px solid #e8eaed;
  border-radius: 6px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}

.element-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.element-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #e8f0fe;
  border-radius: 4px;
  font-size: 12px;
  color: #1a73e8;
}
.element-type {
  font-size: 11px;
  color: #5f6368;
}

.add-relation-dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.add-relation-dialog {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.add-relation-dialog-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.add-relation-title {
  font-size: 16px;
  font-weight: 500;
  color: #202124;
}
.add-relation-close {
  width: 28px;
  height: 28px;
  padding: 0;
  font-size: 20px;
  line-height: 1;
  color: #5f6368;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.add-relation-close:hover {
  background: #f1f3f4;
  color: #202124;
}
.add-relation-select {
  width: 100%;
  padding: 8px 12px;
  font-size: 13px;
  border: 1px solid #dadce0;
  border-radius: 6px;
}
.add-relation-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e8eaed;
}

.element-select-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.element-select-item {
  display: flex;
  gap: 8px;
  align-items: center;
}
.element-select-item .add-relation-select {
  flex: 1;
}
</style>
