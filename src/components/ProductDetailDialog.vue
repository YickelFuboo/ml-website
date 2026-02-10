<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="card">
      <div class="header">
        <h2 class="title">产品描述</h2>
        <button type="button" class="close-btn" aria-label="关闭" @click="emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="body">
        <div class="name">{{ product?.name }}</div>
        <div v-if="product?.description" class="section">
          <div class="section-title">描述</div>
          <div class="section-content">{{ product.description }}</div>
        </div>
        <div v-if="product?.product_define" class="section">
          <div class="section-title">产品定义</div>
          <pre class="section-content define">{{ product.product_define }}</pre>
        </div>
        <div v-if="!product?.description && !product?.product_define" class="empty">暂无描述与产品定义</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  product: { type: Object, default: null },
})

const emit = defineEmits(['close'])
</script>

<style scoped>
.overlay { position: fixed; inset: 0; z-index: 1100; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); }
.card { width: 100%; max-width: 560px; max-height: 80vh; display: flex; flex-direction: column; background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.12); }
.header { display: flex; align-items: center; justify-content: space-between; padding: 24px 24px 0; }
.title { font-size: 18px; font-weight: 500; color: #202124; }
.close-btn { padding: 4px; color: #5f6368; background: none; border: none; cursor: pointer; border-radius: 50%; }
.close-btn:hover { background: #f1f3f4; color: #202124; }
.body { padding: 16px 24px 24px; overflow-y: auto; }
.name { font-size: 16px; font-weight: 500; color: #202124; margin-bottom: 16px; }
.section { margin-bottom: 16px; }
.section-title { font-size: 12px; color: #5f6368; margin-bottom: 6px; }
.section-content { font-size: 14px; color: #202124; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
.section-content.define { font-family: inherit; }
.empty { font-size: 14px; color: #9aa0a6; }
</style>
