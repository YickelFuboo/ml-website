<template>
  <div class="architecture-manage-tab">
    <div v-if="!hasVersion" class="empty-state">
      请先在顶部选择一个产品版本，再进行架构管理。
    </div>

    <div v-else class="panels">
      <div class="panel panel-left">
        <div class="panel-header">
          <div class="panel-header-left">
            <span class="panel-title">架构元素树</span>
            <div class="view-select-wrap" ref="viewSelectRef">
              <button
                type="button"
                class="view-select-btn"
                aria-haspopup="listbox"
                :aria-expanded="viewSelectOpen"
                @click="viewSelectOpen = !viewSelectOpen"
              >
                {{ currentViewLabel }}
                <svg class="view-select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <div v-if="viewSelectOpen" class="view-select-dropdown" role="listbox">
                <button
                  v-for="v in views"
                  :key="v.id"
                  type="button"
                  class="view-select-option"
                  :class="{ active: currentView === v.id }"
                  role="option"
                  @click="currentView = v.id; viewSelectOpen = false"
                >
                  {{ v.label }}
                </button>
              </div>
            </div>
          </div>
          <div class="panel-actions">
            <button type="button" class="btn primary" @click="handleAdd">新增</button>
            <button type="button" class="btn danger" :disabled="!selectedNodeId" @click="handleDeleteNode">删除</button>
          </div>
        </div>
        <div class="panel-body tree">
          <div v-if="flatNodes.length === 0" class="placeholder">暂无节点，请点击「新增」</div>
          <button
            v-for="item in flatNodes"
            :key="item.node.id"
            type="button"
            class="tree-node"
            :class="{ active: selectedNodeId === item.node.id }"
            :style="{ paddingLeft: `${12 + item.depth * 16}px` }"
            @click="selectedNodeId = item.node.id"
          >
            <span class="node-icon">{{ getTypeIcon(item.node.type) }}</span>
            <span class="node-name">{{ item.node.name || '未命名节点' }}</span>
            <span class="node-type">{{ getTypeLabel(item.node.type) }}</span>
          </button>
        </div>
      </div>

      <div class="panel panel-center">
        <div class="panel-header">
          <span class="panel-title">节点详情</span>
        </div>
        <div class="panel-body">
          <div v-if="!selectedNode" class="placeholder">请选择左侧树中的节点</div>
          <div v-else class="detail-form">
            <div class="field">
              <label>名称</label>
              <input v-model="nodeDraft.name" type="text" placeholder="节点名称" />
            </div>
            <div class="field">
              <label>类型</label>
              <select v-model="nodeDraft.type">
                <option value="component">组件</option>
                <option value="service">服务</option>
                <option value="data">数据</option>
                <option value="infra">基础设施</option>
                <option value="other">其它</option>
              </select>
            </div>
            <div class="field">
              <label>描述</label>
              <textarea v-model="nodeDraft.description" rows="3" placeholder="选填" />
            </div>
            <div class="field">
              <label>节点内容（MD）</label>
              <textarea v-model="nodeDraft.contentMd" class="textarea-md" rows="10" placeholder="选填，用于生成架构文档" />
            </div>
            <div class="form-actions">
              <button type="button" class="btn primary" @click="handleSaveNode">保存节点</button>
            </div>
          </div>
        </div>
      </div>

      <div class="panel panel-right">
        <div class="panel-header">
          <span class="panel-title">架构设计文档（MD）</span>
        </div>
        <div class="panel-body doc">
          <textarea v-model="docDraft" class="doc-textarea" placeholder="可点击「生成文档」自动汇总，也可手工编辑并保存。" />
          <div class="form-actions doc-actions">
            <button type="button" class="btn secondary" @click="handleGenerateDoc">生成文档</button>
            <button type="button" class="btn primary" @click="handleSaveDoc">保存文档</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { isProductLoggedIn } from '../../api/requestProduct.js'
import { useProductSelection } from '../../composables/useProductSelection.js'
import { useArchitecture } from '../../composables/useArchitecture.js'

const viewSelectRef = ref(null)
const viewSelectOpen = ref(false)
const currentView = ref('logical')
const views = [
  { id: 'logical', label: '逻辑视图' },
  { id: 'impl', label: '实现视图' },
  { id: 'deploy', label: '部署视图' },
]
const currentViewLabel = computed(() => views.find((v) => v.id === currentView.value)?.label || '')

function onViewSelectDocumentClick(e) {
  if (viewSelectOpen.value && viewSelectRef.value && !viewSelectRef.value.contains(e.target)) {
    viewSelectOpen.value = false
  }
}
onMounted(() => document.addEventListener('click', onViewSelectDocumentClick))
onUnmounted(() => document.removeEventListener('click', onViewSelectDocumentClick))

const { selectedVersionId } = useProductSelection()
const hasVersion = computed(() => !!selectedVersionId.value)

const {
  flatNodes,
  selectedNodeId,
  selectedNode,
  addNode,
  updateNode,
  deleteNode,
  doc,
  setDoc,
  generateDoc,
  save,
} = useArchitecture(selectedVersionId, currentView)

const nodeDraft = ref({ name: '', type: 'component', description: '', contentMd: '' })
const docDraft = ref('')

watch(
  selectedNode,
  (n) => {
    if (!n) {
      nodeDraft.value = { name: '', type: 'component', description: '', contentMd: '' }
      return
    }
    nodeDraft.value = {
      name: n.name || '',
      type: n.type || 'component',
      description: n.description || '',
      contentMd: n.contentMd || '',
    }
  },
  { immediate: true }
)

watch(
  doc,
  (d) => {
    docDraft.value = typeof d === 'string' ? d : ''
  },
  { immediate: true }
)

function requireLoginAndVersion() {
  if (!hasVersion.value) {
    alert('请先选择一个产品版本')
    return false
  }
  if (!isProductLoggedIn()) {
    alert('请先登录')
    return false
  }
  return true
}

function handleAdd() {
  if (!requireLoginAndVersion()) return
  addNode(selectedNodeId.value || '')
}

function handleDeleteNode() {
  if (!requireLoginAndVersion()) return
  if (!selectedNodeId.value) return
  if (!window.confirm('确定删除该节点及其所有子节点？')) return
  deleteNode(selectedNodeId.value)
}

function handleSaveNode() {
  if (!requireLoginAndVersion()) return
  if (!selectedNodeId.value) return
  const name = nodeDraft.value.name?.trim()
  if (!name) {
    alert('请输入节点名称')
    return
  }
  updateNode(selectedNodeId.value, {
    name,
    type: nodeDraft.value.type,
    description: nodeDraft.value.description || '',
    contentMd: nodeDraft.value.contentMd || '',
  })
}

function handleGenerateDoc() {
  if (!requireLoginAndVersion()) return
  const content = generateDoc(`架构设计文档 - ${currentViewLabel.value}`)
  docDraft.value = content
}

function handleSaveDoc() {
  if (!requireLoginAndVersion()) return
  setDoc(docDraft.value || '')
}

function getTypeLabel(t) {
  if (t === 'service') return '服务'
  if (t === 'data') return '数据'
  if (t === 'infra') return '基础设施'
  if (t === 'other') return '其它'
  return '组件'
}

function getTypeIcon(t) {
  if (t === 'service') return '🧩'
  if (t === 'data') return '🗄️'
  if (t === 'infra') return '🧱'
  if (t === 'other') return '📌'
  return '📦'
}
</script>

<style scoped>
.architecture-manage-tab { display: flex; flex-direction: column; flex: 1; min-height: 0; }

.btn { padding: 6px 12px; font-size: 13px; border-radius: 6px; cursor: pointer; border: none; }
.btn.primary { color: #fff; background: #1a73e8; }
.btn.primary:hover:not(:disabled) { background: #1765cc; }
.btn.secondary { color: #202124; background: #f1f3f4; }
.btn.secondary:hover:not(:disabled) { background: #e8eaed; }
.btn.danger { color: #fff; background: #d93025; }
.btn.danger:hover:not(:disabled) { background: #b71c1c; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

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
.panel-left { width: 28%; min-width: 280px; max-width: 420px; }
.panel-center { width: 32%; min-width: 320px; max-width: 520px; }
.panel-right { flex: 1; min-width: 0; }
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
.view-select-wrap { position: relative; }
.view-select-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: 13px;
  color: #202124;
  background: #fff;
  border: 1px solid #dadce0;
  border-radius: 6px;
  cursor: pointer;
}
.view-select-btn:hover { background: #f8f9fa; border-color: #c4c7c5; }
.view-select-arrow { flex-shrink: 0; color: #5f6368; }
.view-select-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 100;
  min-width: 100%;
  padding: 4px 0;
  background: #fff;
  border: 1px solid #dadce0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.view-select-option {
  display: block;
  width: 100%;
  padding: 6px 12px;
  font-size: 13px;
  color: #202124;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  line-height: 1.35;
}
.view-select-option:hover { background: #f1f3f4; }
.view-select-option.active { background: #e8f0fe; color: #1a73e8; }

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
.node-type { font-size: 12px; color: #5f6368; flex-shrink: 0; }
.tree-node.active .node-type { color: #1a73e8; }

.detail-form { padding: 16px; }
.field { margin-bottom: 14px; }
.field label { display: block; margin-bottom: 6px; font-size: 14px; color: #202124; }
.field input, .field textarea, .field select {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #dadce0;
  border-radius: 6px;
  box-sizing: border-box;
}
.field textarea { resize: vertical; min-height: 72px; }
.textarea-md { min-height: 240px; height: 240px; }
.form-actions { margin-top: 8px; display: flex; justify-content: flex-end; gap: 10px; }

.doc { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.doc-textarea {
  width: 100%;
  flex: 1;
  min-height: 360px;
  height: 360px;
  padding: 12px;
  font-size: 14px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  box-sizing: border-box;
  resize: vertical;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}
.doc-actions { justify-content: flex-end; }
</style>
