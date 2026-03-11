<template>
  <div class="qa-page">
    <AgentAssistantContent />
  </div>
</template>

<script setup>
import AgentAssistantContent from '../components/AgentAssistantContent.vue'
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
