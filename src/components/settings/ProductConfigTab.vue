<template>
  <div class="product-config-tab">
    <div class="panels">
      <div class="panel-left">
        <div class="panel-header">
          <span class="panel-title">产品与版本</span>
          <div class="panel-actions">
            <button type="button" class="btn primary" @click="openAddProduct">新增产品</button>
            <button
              v-if="localSelectedProductId"
              type="button"
              class="btn primary"
              @click="openAddVersion"
            >
              新增版本
            </button>
            <button
              v-if="localSelectedProductId && !selectedNodeVersion"
              type="button"
              class="btn danger"
              @click="confirmDeleteProduct"
            >
              删除产品
            </button>
            <button
              v-if="selectedNodeVersion"
              type="button"
              class="btn danger"
              @click="confirmDeleteVersion"
            >
              删除版本
            </button>
          </div>
        </div>
        <div v-if="loading" class="loading">加载中…</div>
        <div v-else class="tree">
          <div
            v-for="product in productList"
            :key="product.id"
            class="tree-node product-node"
          >
            <button
              type="button"
              class="tree-label"
              :class="{ active: localSelectedProductId === product.id && !selectedNodeVersion }"
              @click="selectProduct(product)"
            >
              <span class="tree-icon" aria-hidden="true">P</span>
              <span class="tree-text">{{ product.name }}</span>
            </button>
            <div class="tree-children">
              <button
                v-for="ver in (product.versions || [])"
                :key="ver.id"
                type="button"
                class="tree-label version-label"
                :class="{ active: selectedVersionId === ver.id }"
                @click="selectVersion(product, ver)"
              >
                <span class="tree-icon" aria-hidden="true">V</span>
                <span class="tree-text">{{ ver.name }}</span>
              </button>
              <div v-if="!product.versions || product.versions.length === 0" class="tree-empty">暂无版本</div>
            </div>
          </div>
          <div v-if="productList.length === 0" class="tree-empty">暂无产品</div>
        </div>
      </div>
      <div class="panel-right">
        <div class="panel-header panel-header-right">
          <span class="panel-title">详情</span>
        </div>
        <div v-if="!localSelectedProductId" class="placeholder">请在左侧选择产品或版本</div>
        <template v-else-if="selectedNodeVersion">
          <div class="detail-form">
            <div class="field">
              <label>版本名称</label>
              <input v-model="versionForm.name" type="text" placeholder="版本名称" />
            </div>
            <div class="form-actions">
              <button type="button" class="btn primary" :disabled="saving" @click="saveVersion">保存</button>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="detail-form">
            <div class="field">
              <label>产品名称</label>
              <input v-model="productForm.name" type="text" placeholder="产品名称" />
            </div>
            <div class="field">
              <label>描述</label>
              <textarea v-model="productForm.description" rows="2" placeholder="选填" />
            </div>
            <div class="field field-md field-define">
              <div class="field-md-header">
                <label>产品定义（MD）</label>
                <button type="button" class="btn-md-toggle" @click="productDefineShowPreview = !productDefineShowPreview">{{ productDefineShowPreview ? '源码' : '效果' }}</button>
              </div>
              <textarea v-if="!productDefineShowPreview" v-model="productForm.product_define" rows="6" placeholder="选填，一般为 Markdown" class="textarea-define" />
              <div v-else class="md-preview md-preview-define" v-html="renderMd(productForm.product_define)" />
            </div>
            <div class="form-actions">
              <button type="button" class="btn primary" :disabled="saving" @click="saveProduct">保存</button>
            </div>
          </div>
        </template>
      </div>
    </div>
    <ProductFormDialog
      v-if="showProductForm"
      :product="productFormTarget"
      @close="showProductForm = false; productFormTarget = null"
      @success="onProductFormSuccess"
    />
    <VersionFormDialog
      v-if="showVersionForm"
      :product-id="versionFormProductId"
      :product-name="versionFormProductName"
      :version="versionFormTarget"
      @close="showVersionForm = false; versionFormTarget = null"
      @success="onVersionFormSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { marked } from 'marked'
import { useProductSelection } from '../../composables/useProductSelection.js'
import { updateProduct, updateVersion, deleteProduct, deleteVersion } from '../../api/product.js'
import { isProductLoggedIn } from '../../api/requestProduct.js'
import ProductFormDialog from '../ProductFormDialog.vue'
import VersionFormDialog from '../VersionFormDialog.vue'

const productDefineShowPreview = ref(false)
function renderMd(text) {
  const s = text != null ? String(text).trim() : ''
  if (!s) return '<p class="md-empty">暂无内容</p>'
  return marked.parse(s)
}

const {
  productList,
  selectedProductId,
  selectedVersionId,
  fetchList,
  updateListAfterEdit,
  updateListAfterVersionEdit,
  addProductToList,
  addVersionToProduct,
  removeProductFromList,
  removeVersionFromList,
} = useProductSelection()

const loading = ref(false)
const saving = ref(false)
const localSelectedProductId = ref('')
const localSelectedVersionId = ref('')
const selectedNodeVersion = ref(null)
const productForm = ref({ name: '', description: '', product_define: '' })
const versionForm = ref({ name: '' })
const showProductForm = ref(false)
const productFormTarget = ref(null)
const showVersionForm = ref(false)
const versionFormProductId = ref('')
const versionFormProductName = ref('')
const versionFormTarget = ref(null)

const selectedProduct = computed(() => productList.value.find((p) => p.id === localSelectedProductId.value) || null)

onMounted(async () => {
  loading.value = true
  try {
    await fetchList()
    localSelectedProductId.value = selectedProductId.value
    localSelectedVersionId.value = selectedVersionId.value
  } catch (e) {
    if (e?.needLogin) alert('请先登录')
  } finally {
    loading.value = false
  }
})

watch(
  () => [localSelectedProductId.value, localSelectedVersionId.value],
  () => {
    selectedNodeVersion.value = null
    if (localSelectedVersionId.value && selectedProduct.value) {
      const ver = selectedProduct.value.versions?.find((v) => v.id === localSelectedVersionId.value)
      selectedNodeVersion.value = ver || null
    }
  },
  { immediate: true }
)

watch(
  selectedProduct,
  (p) => {
    if (!p) return
    productForm.value = {
      name: p.name ?? '',
      description: p.description ?? '',
      product_define: p.product_define ?? '',
    }
  },
  { immediate: true }
)

watch(
  selectedNodeVersion,
  (v) => {
    if (!v) return
    versionForm.value = { name: v.name ?? '' }
  },
  { immediate: true }
)

function selectProduct(product) {
  localSelectedProductId.value = product.id
  localSelectedVersionId.value = ''
  selectedNodeVersion.value = null
}

function selectVersion(product, version) {
  localSelectedProductId.value = product.id
  localSelectedVersionId.value = version.id
  selectedNodeVersion.value = version
}

function openAddProduct() {
  if (!isProductLoggedIn()) {
    alert('请先登录')
    return
  }
  productFormTarget.value = null
  showProductForm.value = true
}

function openAddVersion() {
  if (!selectedProduct.value) return
  versionFormProductId.value = selectedProduct.value.id
  versionFormProductName.value = selectedProduct.value.name
  versionFormTarget.value = null
  showVersionForm.value = true
}

function onProductFormSuccess(result) {
  if (productFormTarget.value?.id && result?.id) {
    updateListAfterEdit(result)
  } else if (result?.id) {
    addProductToList(result)
  }
}

function onVersionFormSuccess(result) {
  if (versionFormTarget.value?.id && result?.id) {
    updateListAfterVersionEdit(versionFormProductId.value, result)
  } else if (result?.id) {
    addVersionToProduct(versionFormProductId.value, result)
  }
}

async function saveProduct() {
  if (!selectedProductId.value) return
  const name = productForm.value.name?.trim()
  if (!name) {
    alert('请输入产品名称')
    return
  }
  saving.value = true
  try {
    const result = await updateProduct(selectedProductId.value, {
      name: productForm.value.name,
      description: productForm.value.description || undefined,
      product_define: productForm.value.product_define || undefined,
    })
    updateListAfterEdit(result)
  } catch (e) {
    alert(e?.needLogin ? '请先登录' : (e?.data?.detail || e?.message || '保存失败'))
  } finally {
    saving.value = false
  }
}

async function saveVersion() {
  if (!selectedNodeVersion.value) return
  const name = versionForm.value.name?.trim()
  if (!name) {
    alert('请输入版本名称')
    return
  }
  saving.value = true
  try {
    const result = await updateVersion(selectedNodeVersion.value.id, { name })
    updateListAfterVersionEdit(localSelectedProductId.value, result)
    selectedNodeVersion.value = result
  } catch (e) {
    alert(e?.needLogin ? '请先登录' : (e?.data?.detail || e?.message || '保存失败'))
  } finally {
    saving.value = false
  }
}

function confirmDeleteProduct() {
  const p = selectedProduct.value
  if (!p) return
  if (!window.confirm(`确定删除产品「${p.name}」？其下版本将一并删除。`)) return
  deleteProduct(p.id)
    .then(() => {
      removeProductFromList(p.id)
      setSelection(productList.value[0]?.id || '', productList.value[0]?.versions?.[0]?.id || '')
    })
    .catch((e) => alert(e?.needLogin ? '请先登录' : (e?.data?.detail || e?.message || '删除失败')))
}

function confirmDeleteVersion() {
  const p = selectedProduct.value
  const v = selectedNodeVersion.value
  if (!p || !v) return
  if (!window.confirm(`确定删除版本「${v.name}」？`)) return
  deleteVersion(v.id)
    .then(() => {
      removeVersionFromList(p.id, v.id)
      selectedNodeVersion.value = null
      const prod = productList.value.find((x) => x.id === p.id)
      localSelectedVersionId.value = prod?.versions?.[0]?.id || ''
    })
    .catch((e) => alert(e?.needLogin ? '请先登录' : (e?.data?.detail || e?.message || '删除失败')))
}
</script>

<style scoped>
.product-config-tab {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.btn { padding: 6px 12px; font-size: 13px; border-radius: 6px; cursor: pointer; border: none; background: #111; color: #fff; }
.btn:hover:not(:disabled) { background: #000; }
.btn:focus-visible { outline: 2px solid rgba(0,0,0,0.35); outline-offset: 2px; }
.btn.primary { color: #fff; background: #111; }
.btn.primary:hover:not(:disabled) { background: #000; }
.btn.primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn.secondary { color: #fff; background: #111; }
.btn.secondary:hover:not(:disabled) { background: #000; }
.btn.danger { color: #fff; background: #111; }
.btn.danger:hover:not(:disabled) { background: #000; }
.panels {
  display: flex;
  flex: 1;
  min-height: 0;
  gap: 12px;
}
.panel-left {
  width: 32%;
  min-width: 280px;
  max-width: 400px;
  min-height: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 40px;
  padding: 0 16px;
  border-bottom: 1px solid #e8eaed;
  flex-shrink: 0;
}
.panel-left .panel-header {
  background: #fff;
}
.panel-header .panel-title {
  font-size: 15px;
  font-weight: 400;
  color: #202124;
}
.panel-header-right {
  justify-content: flex-start;
}
.panel-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-left: auto;
}
.panel-left .loading {
  flex: 1;
  padding: 12px 16px;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
.panel-left .tree {
  flex: 1;
  padding: 12px 16px;
  overflow-y: auto;
}
.loading, .placeholder { padding: 24px; font-size: 14px; color: #9aa0a6; text-align: center; }
.tree-node { margin-bottom: 4px; }
.tree-label {
  display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px 12px;
  font-size: 14px; color: #202124; background: none; border: none; border-radius: 6px; cursor: pointer; text-align: left;
}
.tree-label:hover { background: #f1f3f4; }
.tree-label.active { background: #e8f0fe; color: #1a73e8; }
.tree-icon {
  width: 18px;
  height: 18px;
  display: inline-grid;
  place-items: center;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  flex-shrink: 0;
  background: #9aa0a6;
  color: #fff;
}
.tree-label:hover .tree-icon { background: #80868b; }
.tree-label.active .tree-icon { background: #3c4043; color: #fff; }
.tree-text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tree-children { margin-left: 20px; }
.version-label .tree-icon { background: #9aa0a6; color: #fff; }
.tree-empty { font-size: 13px; color: #9aa0a6; padding: 8px 12px 8px 28px; }
.panel-right {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.detail-form {
  flex: 1;
  min-height: 0;
  padding: 16px 24px 20px;
  overflow-y: auto;
}
.detail-form .field { margin-bottom: 20px; }
.detail-form label { display: block; margin-bottom: 6px; font-size: 14px; color: #202124; }
.detail-form input, .detail-form textarea {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.5;
  color: #202124;
  border: 1px solid #dadce0;
  border-radius: 6px;
  box-sizing: border-box;
}
.detail-form textarea { resize: vertical; min-height: 60px; }
.detail-form .textarea-define { min-height: 120px; height: 120px; }
.field-md-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.field-md-header label { margin-bottom: 0; }
.detail-form .btn-md-toggle {
  flex-shrink: 0;
  padding: 4px 10px;
  font-size: 12px;
  color: #5f6368;
  background: #f1f3f4;
  border: 1px solid #dadce0;
  border-radius: 6px;
  cursor: pointer;
}
.detail-form .btn-md-toggle:hover {
  background: #e8eaed;
  color: #202124;
}
.detail-form .md-preview {
  min-height: 120px;
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.6;
  color: #202124;
  background: #f8f9fa;
  border: 1px solid #dadce0;
  border-radius: 6px;
  box-sizing: border-box;
  overflow: auto;
}
.detail-form .md-preview :deep(h1) { font-size: 1.25em; margin: 0 0 0.5em; }
.detail-form .md-preview :deep(h2) { font-size: 1.1em; margin: 0.75em 0 0.35em; }
.detail-form .md-preview :deep(h3) { font-size: 1em; margin: 0.5em 0 0.25em; }
.detail-form .md-preview :deep(p) { margin: 0 0 0.5em; }
.detail-form .md-preview :deep(ul), .detail-form .md-preview :deep(ol) { margin: 0 0 0.5em; padding-left: 1.5em; }
.detail-form .md-preview :deep(code) { background: #e8eaed; padding: 0.1em 0.4em; border-radius: 4px; font-size: 0.9em; }
.detail-form .md-preview :deep(pre) { background: #e8eaed; padding: 10px; border-radius: 6px; overflow: auto; margin: 0 0 0.5em; }
.detail-form .md-preview :deep(pre code) { background: none; padding: 0; }
.detail-form .md-preview .md-empty { color: #9aa0a6; margin: 0; }
.form-actions { margin-top: 12px; }
</style>
