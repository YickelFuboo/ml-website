<template>
  <div class="qa-overlay" @click.self="emit('close')">
    <div class="qa-dialog">
      <div class="qa-dialog-header">
        <h2 class="qa-dialog-title">知识问答</h2>
        <button type="button" class="qa-close" aria-label="关闭" @click="emit('close')">×</button>
      </div>
      <div class="qa-dialog-body">
        <KnowledgeQAContent :tenant-id="tenantId" />
      </div>
    </div>
  </div>
</template>

<script setup>
import KnowledgeQAContent from './KnowledgeQAContent.vue'

defineProps({
  tenantId: { type: String, default: '' },
})

const emit = defineEmits(['close'])
</script>

<style scoped>
.qa-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.qa-dialog {
  width: 92%;
  max-width: 1000px;
  height: 85vh;
  max-height: 760px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.qa-dialog-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid #e8eaed;
}
.qa-dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #202124;
  margin: 0;
}
.qa-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #5f6368;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.qa-close:hover {
  background: #f1f3f4;
  color: #202124;
}
.qa-dialog-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
