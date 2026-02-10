import { ref, computed } from 'vue'
import { getProductList } from '../api/product.js'

const productList = ref([])
const selectedProductId = ref('')
const selectedVersionId = ref('')

export function useProductSelection() {
  const selectedProduct = computed(() =>
    productList.value.find((p) => p.id === selectedProductId.value) || null
  )
  const selectedVersion = computed(() => {
    const p = selectedProduct.value
    if (!p || !p.versions) return null
    return p.versions.find((v) => v.id === selectedVersionId.value) || null
  })
  const displayLabel = computed(() => {
    const p = selectedProduct.value
    const v = selectedVersion.value
    if (!p) return '请选择产品'
    if (!v) return p.name
    return `${p.name} - ${v.name}`
  })

  async function fetchList() {
    const items = await getProductList({ page_size: 100 })
    productList.value = items || []
    if (productList.value.length && !selectedProduct.value) {
      const first = productList.value[0]
      selectedProductId.value = first.id
      if (first.versions && first.versions.length) {
        selectedVersionId.value = first.versions[0].id
      } else {
        selectedVersionId.value = ''
      }
    }
    if (selectedProduct.value && selectedVersionId.value) {
      const cur = selectedProduct.value.versions?.find((v) => v.id === selectedVersionId.value)
      if (!cur) {
        selectedVersionId.value = selectedProduct.value.versions?.[0]?.id || ''
      }
    }
    return productList.value
  }

  function setSelection(productId, versionId) {
    selectedProductId.value = productId || ''
    selectedVersionId.value = versionId || ''
  }

  function updateListAfterEdit(updatedProduct) {
    const idx = productList.value.findIndex((p) => p.id === updatedProduct.id)
    if (idx >= 0) {
      const next = [...productList.value]
      next[idx] = { ...next[idx], ...updatedProduct }
      productList.value = next
    }
  }

  function updateListAfterVersionEdit(productId, updatedVersion) {
    const idx = productList.value.findIndex((p) => p.id === productId)
    if (idx >= 0 && productList.value[idx].versions) {
      const next = [...productList.value]
      const versions = next[idx].versions.map((v) =>
        v.id === updatedVersion.id ? { ...v, ...updatedVersion } : v
      )
      next[idx] = { ...next[idx], versions }
      productList.value = next
    }
  }

  function addProductToList(product) {
    productList.value = [{ ...product, versions: [] }, ...productList.value]
  }

  function addVersionToProduct(productId, version) {
    const idx = productList.value.findIndex((p) => p.id === productId)
    if (idx >= 0) {
      const next = [...productList.value]
      next[idx] = {
        ...next[idx],
        versions: [...(next[idx].versions || []), version],
      }
      productList.value = next
    }
  }

  function removeProductFromList(productId) {
    productList.value = productList.value.filter((p) => p.id !== productId)
    if (selectedProductId.value === productId) {
      selectedProductId.value = productList.value[0]?.id || ''
      selectedVersionId.value = productList.value[0]?.versions?.[0]?.id || ''
    }
  }

  function removeVersionFromList(productId, versionId) {
    const idx = productList.value.findIndex((p) => p.id === productId)
    if (idx >= 0 && productList.value[idx].versions) {
      const next = [...productList.value]
      next[idx] = {
        ...next[idx],
        versions: next[idx].versions.filter((v) => v.id !== versionId),
      }
      productList.value = next
      if (selectedVersionId.value === versionId) {
        selectedVersionId.value = next[idx].versions?.[0]?.id || ''
      }
    }
  }

  return {
    productList,
    selectedProductId,
    selectedVersionId,
    selectedProduct,
    selectedVersion,
    displayLabel,
    fetchList,
    setSelection,
    updateListAfterEdit,
    updateListAfterVersionEdit,
    addProductToList,
    addVersionToProduct,
    removeProductFromList,
    removeVersionFromList,
  }
}
