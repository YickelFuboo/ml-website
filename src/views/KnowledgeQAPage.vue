<template>
  <div class="qa-page">
    <KnowledgeQAContent :tenant-id="selectedVersionId" />
  </div>
</template>

<script setup>
import KnowledgeQAContent from '../components/KnowledgeQAContent.vue'
import { useProductSelection } from '../composables/useProductSelection.js'

const { selectedVersionId } = useProductSelection()
</script>

<style scoped>
.qa-page {
  flex: 1;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 12px 24px 16px;
  background: #f0f2f5;
  overflow: hidden;
}
</style>
