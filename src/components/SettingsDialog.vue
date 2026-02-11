<template>
  <div class="settings-overlay" @click.self="emit('close')">
    <div class="settings-dialog">
      <div class="settings-dialog-header">
        <h2 class="settings-dialog-title">设置</h2>
        <div class="settings-dialog-actions">
          <button type="button" class="close-btn" aria-label="关闭" @click="emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="settings-dialog-body">
        <SettingsPageContent />
      </div>
    </div>
  </div>
</template>

<script setup>
import SettingsPageContent from '../views/SettingsPage.vue'

const emit = defineEmits(['close'])
</script>

<style scoped>
.settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.settings-dialog {
  width: 90%;
  max-width: 100%;
  height: 92vh;
  max-height: 92vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.settings-dialog-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  border-bottom: 1px solid #e8eaed;
  background: #fff;
}
.settings-dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #202124;
  margin: 0;
}
.settings-dialog-actions {
  display: flex;
  align-items: center;
}
.close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  color: #5f6368;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.close-btn:hover {
  background: #f1f3f4;
  color: #202124;
}
.settings-dialog-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
