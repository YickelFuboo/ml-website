<template>
  <div class="product-selector-wrap" ref="wrapRef">
    <button
      type="button"
      class="product-selector-btn"
      aria-haspopup="listbox"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="product-selector-label">{{ displayLabel }}</span>
      <svg class="product-selector-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
    <div v-if="open" class="product-selector-dropdown" role="listbox">
      <div
        v-for="product in productList"
        :key="product.id"
        class="product-group"
      >
        <div class="product-group-name">{{ product.name }}</div>
        <button
          v-for="ver in (product.versions || [])"
          :key="ver.id"
          type="button"
          class="product-option"
          :class="{ active: selectedVersionId === ver.id }"
          role="option"
          @click="onSelect(product.id, ver.id)"
        >
          {{ ver.name }}
        </button>
        <button
          v-if="!product.versions || product.versions.length === 0"
          type="button"
          class="product-option empty"
          disabled
        >
          暂无版本
        </button>
      </div>
      <div v-if="productList.length === 0" class="product-selector-empty">暂无产品</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useProductSelection } from '../composables/useProductSelection.js'

const wrapRef = ref(null)
const open = ref(false)

const {
  productList,
  selectedVersionId,
  displayLabel,
  fetchList,
  setSelection,
} = useProductSelection()

function onSelect(productId, versionId) {
  setSelection(productId, versionId)
  open.value = false
}

function onDocumentClick(e) {
  if (open.value && wrapRef.value && !wrapRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => {
  fetchList().catch((e) => { if (e?.needLogin) alert('请先登录') })
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<style scoped>
.product-selector-wrap {
  position: relative;
}
.product-selector-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 140px;
  padding: 8px 12px;
  font-size: 14px;
  color: #202124;
  background: #fff;
  border: 1px solid #dadce0;
  border-radius: 8px;
  cursor: pointer;
}
.product-selector-btn:hover {
  border-color: #1a73e8;
  background: #f8fafc;
}
.product-selector-label {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.product-selector-arrow {
  flex-shrink: 0;
  color: #5f6368;
}
.product-selector-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 150;
  min-width: 220px;
  max-height: 320px;
  overflow-y: auto;
  padding: 8px 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.08);
}
.product-group {
  padding: 4px 0;
}
.product-group-name {
  padding: 6px 12px;
  font-size: 12px;
  color: #5f6368;
  font-weight: 500;
}
.product-option {
  display: block;
  width: 100%;
  padding: 8px 12px 8px 24px;
  font-size: 14px;
  color: #202124;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}
.product-option:hover {
  background: #f1f3f4;
}
.product-option.active {
  background: #e8f0fe;
  color: #1a73e8;
}
.product-option.empty {
  cursor: default;
  color: #9aa0a6;
}
.product-selector-empty {
  padding: 16px 12px;
  font-size: 14px;
  color: #9aa0a6;
  text-align: center;
}
</style>
