<template>
  <div class="settings-page">
    <div class="settings-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="settings-content">
      <ProductConfigTab v-if="activeTab === 'product'" />
      <ScenarioManageTab v-else-if="activeTab === 'scenario'" />
      <ArchitectureManageTab v-else-if="activeTab === 'architecture'" />
      <KnowledgeManageTab v-else-if="activeTab === 'knowledge'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProductConfigTab from '../components/settings/ProductConfigTab.vue'
import ScenarioManageTab from '../components/settings/ScenarioManageTab.vue'
import ArchitectureManageTab from '../components/settings/ArchitectureManageTab.vue'
import KnowledgeManageTab from '../components/settings/KnowledgeManageTab.vue'

const activeTab = ref('product')
const tabs = [
  { id: 'product', label: '产品配置' },
  { id: 'scenario', label: '场景管理' },
  { id: 'architecture', label: '架构管理' },
  { id: 'knowledge', label: '知识库管理' },
]
</script>

<style scoped>
.settings-page {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 12px 24px 16px;
  background: #f0f2f5;
  overflow: hidden;
}
.settings-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  flex-shrink: 0;
}
.tab-btn {
  padding: 8px 16px;
  font-size: 14px;
  color: #5f6368;
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  cursor: pointer;
}
.tab-btn:hover {
  color: #202124;
  background: #f8fafc;
}
.tab-btn.active {
  color: #1a73e8;
  background: #e8f0fe;
  border-color: #1a73e8;
}
.settings-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
