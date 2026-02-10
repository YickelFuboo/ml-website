<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="card">
      <div class="header">
        <h2 class="title">产品与版本管理</h2>
        <button type="button" class="close-btn" aria-label="关闭" @click="emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="toolbar">
        <button type="button" class="btn primary" @click="openAddProduct">新增产品</button>
      </div>
      <div class="list-wrap">
        <div v-if="loading" class="loading">加载中…</div>
        <template v-else>
          <div v-for="product in productList" :key="product.id" class="product-block">
            <div class="product-row">
              <span class="product-name">{{ product.name }}</span>
              <span class="product-actions">
                <button type="button" class="link-btn" @click="openViewProduct(product)">查看描述</button>
                <button type="button" class="link-btn" @click="openEditProduct(product)">编辑</button>
                <button type="button" class="link-btn" @click="openAddVersion(product)">新增版本</button>
                <button type="button" class="link-btn danger" @click="confirmDeleteProduct(product)">删除</button>
              </span>
            </div>
            <div class="version-list">
              <div v-for="ver in (product.versions || [])" :key="ver.id" class="version-row">
                <span class="version-name">{{ ver.name }}</span>
                <span class="version-actions">
                  <button type="button" class="link-btn" @click="openEditVersion(product, ver)">编辑</button>
                  <button type="button" class="link-btn danger" @click="confirmDeleteVersion(product, ver)">删除</button>
                </span>
              </div>
              <div v-if="!product.versions || product.versions.length === 0" class="version-empty">暂无版本</div>
            </div>
          </div>
          <div v-if="productList.length === 0" class="empty">暂无产品，请点击「新增产品」</div>
        </template>
      </div>
    </div>
    <ProductFormDialog
      v-if="showProductForm"
      :product="productFormTarget"
      @close="showProductForm = false; productFormTarget = null"
      @success="(result) => onProductFormSuccess(result)"
    />
    <VersionFormDialog
      v-if="showVersionForm"
      :product-id="versionFormProductId"
      :product-name="versionFormProductName"
      :version="versionFormTarget"
      @close="showVersionForm = false; versionFormTarget = null"
      @success="(result) => onVersionFormSuccess(result)"
    />
    <ProductDetailDialog
      v-if="showDetailProduct"
      :product="detailProduct"
      @close="showDetailProduct = false; detailProduct = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductSelection } from '../composables/useProductSelection.js'
import { deleteProduct, deleteVersion } from '../api/product.js'
import { isProductLoggedIn } from '../api/requestProduct.js'
import ProductFormDialog from './ProductFormDialog.vue'
import VersionFormDialog from './VersionFormDialog.vue'
import ProductDetailDialog from './ProductDetailDialog.vue'

const emit = defineEmits(['close'])

const {
  productList,
  fetchList,
  updateListAfterEdit,
  updateListAfterVersionEdit,
  addProductToList,
  addVersionToProduct,
  removeProductFromList,
  removeVersionFromList,
} = useProductSelection()

const loading = ref(false)
const showProductForm = ref(false)
const productFormTarget = ref(null)
const showVersionForm = ref(false)
const versionFormProductId = ref('')
const versionFormProductName = ref('')
const versionFormTarget = ref(null)
const showDetailProduct = ref(false)
const detailProduct = ref(null)

onMounted(async () => {
  loading.value = true
  try {
    await fetchList()
  } finally {
    loading.value = false
  }
})

function openAddProduct() {
  if (!isProductLoggedIn()) {
    alert('请先登录')
    return
  }
  productFormTarget.value = null
  showProductForm.value = true
}

function openEditProduct(product) {
  productFormTarget.value = product
  showProductForm.value = true
}

function openViewProduct(product) {
  detailProduct.value = product
  showDetailProduct.value = true
}

function openAddVersion(product) {
  versionFormProductId.value = product.id
  versionFormProductName.value = product.name
  versionFormTarget.value = null
  showVersionForm.value = true
}

function openEditVersion(product, version) {
  versionFormProductId.value = product.id
  versionFormProductName.value = product.name
  versionFormTarget.value = version
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

function confirmDeleteProduct(product) {
  if (!window.confirm(`确定删除产品「${product.name}」？其下版本将一并删除。`)) return
  deleteProduct(product.id)
    .then(() => {
      removeProductFromList(product.id)
    })
    .catch((e) => {
      alert(e?.data?.detail || e?.message || '删除失败')
    })
}

function confirmDeleteVersion(product, version) {
  if (!window.confirm(`确定删除版本「${version.name}」？`)) return
  deleteVersion(version.id)
    .then(() => {
      removeVersionFromList(product.id, version.id)
    })
    .catch((e) => {
      alert(e?.data?.detail || e?.message || '删除失败')
    })
}
</script>

<style scoped>
.overlay { position: fixed; inset: 0; z-index: 1050; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); }
.card { width: 100%; max-width: 640px; max-height: 85vh; display: flex; flex-direction: column; background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.12); }
.header { display: flex; align-items: center; justify-content: space-between; padding: 24px 24px 0; }
.title { font-size: 18px; font-weight: 500; color: #202124; }
.close-btn { padding: 4px; color: #5f6368; background: none; border: none; cursor: pointer; border-radius: 50%; }
.close-btn:hover { background: #f1f3f4; color: #202124; }
.toolbar { padding: 16px 24px 0; }
.btn.primary { padding: 8px 16px; font-size: 14px; color: #fff; background: #111; border: none; border-radius: 8px; cursor: pointer; }
.btn.primary:hover:not(:disabled) { background: #000; }
.btn.primary:focus-visible { outline: 2px solid rgba(0,0,0,0.35); outline-offset: 2px; }
.btn.primary:disabled { opacity: 0.6; cursor: not-allowed; }
.list-wrap { padding: 16px 24px 24px; overflow-y: auto; flex: 1; }
.loading, .empty { font-size: 14px; color: #9aa0a6; text-align: center; padding: 24px; }
.product-block { margin-bottom: 20px; border: 1px solid #e8eaed; border-radius: 8px; overflow: hidden; }
.product-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #f8fafc; }
.product-name { font-weight: 500; color: #202124; }
.product-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.version-list { padding: 8px 16px 12px; }
.version-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 6px; }
.version-row:hover { background: #f1f3f4; }
.version-name { font-size: 14px; color: #202124; margin-left: 8px; }
.version-actions { display: flex; gap: 8px; }
.version-empty { font-size: 13px; color: #9aa0a6; padding: 8px 12px 8px 24px; }
.link-btn { font-size: 13px; color: #fff; background: #111; border: none; cursor: pointer; padding: 6px 10px; border-radius: 6px; line-height: 1; }
.link-btn:hover:not(:disabled) { background: #000; }
.link-btn:focus-visible { outline: 2px solid rgba(0,0,0,0.35); outline-offset: 2px; }
.link-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.link-btn.danger { color: #fff; background: #111; }
</style>
