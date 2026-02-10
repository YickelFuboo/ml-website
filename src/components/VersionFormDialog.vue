<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="card">
      <div class="header">
        <h2 class="title">{{ isEdit ? '编辑版本' : '新增版本' }}</h2>
        <button type="button" class="close-btn" aria-label="关闭" @click="emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <form class="form" @submit.prevent="handleSubmit">
        <div v-if="!isEdit" class="field">
          <label>所属产品</label>
          <div class="product-name">{{ productName }}</div>
        </div>
        <div class="field">
          <label for="vf-name">版本名称</label>
          <input id="vf-name" v-model="form.name" type="text" placeholder="请输入版本名称" required />
        </div>
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
        <div class="actions">
          <button type="button" class="btn secondary" @click="emit('close')">取消</button>
          <button type="submit" class="btn primary" :disabled="loading">{{ loading ? '保存中…' : '保存' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { createVersion, updateVersion } from '../api/product.js'

const props = defineProps({
  productId: { type: String, default: '' },
  productName: { type: String, default: '' },
  version: { type: Object, default: null },
})

const emit = defineEmits(['close', 'success'])

const isEdit = ref(!!props.version?.id)
const form = ref({ name: '' })
const loading = ref(false)
const errorMsg = ref('')

watch(
  () => props.version,
  (v) => {
    isEdit.value = !!v?.id
    form.value = { name: v?.name ?? '' }
  },
  { immediate: true }
)

async function handleSubmit() {
  errorMsg.value = ''
  const name = form.value.name?.trim()
  if (!name) {
    errorMsg.value = '请输入版本名称'
    return
  }
  loading.value = true
  try {
    let result
    if (isEdit.value && props.version?.id) {
      result = await updateVersion(props.version.id, { name })
    } else {
      if (!props.productId) {
        errorMsg.value = '缺少产品ID'
        loading.value = false
        return
      }
      result = await createVersion({ name, product_id: props.productId })
    }
    emit('success', result)
    emit('close')
  } catch (e) {
    errorMsg.value = e?.data?.detail || e?.message || '保存失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.overlay { position: fixed; inset: 0; z-index: 1100; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); }
.card { width: 100%; max-width: 400px; padding: 24px 32px 32px; background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.12); }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.title { font-size: 18px; font-weight: 500; color: #202124; }
.close-btn { padding: 4px; color: #5f6368; background: none; border: none; cursor: pointer; border-radius: 50%; }
.close-btn:hover { background: #f1f3f4; color: #202124; }
.form .field { margin-bottom: 20px; }
.form label { display: block; margin-bottom: 6px; font-size: 14px; color: #202124; }
.product-name { padding: 8px 12px; font-size: 14px; color: #5f6368; background: #f1f3f4; border-radius: 6px; }
.form input { width: 100%; padding: 8px 12px; font-size: 14px; border: 1px solid #dadce0; border-radius: 6px; box-sizing: border-box; }
.error-msg { margin-bottom: 12px; font-size: 14px; color: #d93025; }
.actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
.btn { padding: 8px 20px; font-size: 14px; border-radius: 8px; cursor: pointer; border: none; background: #111; color: #fff; }
.btn:hover:not(:disabled) { background: #000; }
.btn:focus-visible { outline: 2px solid rgba(0,0,0,0.35); outline-offset: 2px; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn.primary { color: #fff; background: #111; }
.btn.secondary { color: #fff; background: #111; }
</style>
