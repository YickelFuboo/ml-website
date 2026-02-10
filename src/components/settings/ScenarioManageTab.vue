<template>
  <div class="scenario-manage-tab">
    <div class="panels">
      <div class="panel-left">
        <div class="panel-title">场景树</div>
        <div class="placeholder">
          场景管理服务尚未实现，此处预留。将显示当前选中版本下的场景树。
        </div>
      </div>
      <div class="panel-right">
        <div class="panel-title">场景详情</div>
        <div class="placeholder">
          选中场景后在此展示详情，后续补充。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.scenario-manage-tab { display: flex; flex-direction: column; height: 100%; min-height: 480px; }
.panels { display: flex; flex: 1; min-height: 0; }
.panel-left { width: 280px; border-right: 1px solid #e8eaed; display: flex; flex-direction: column; overflow: hidden; }
.panel-title { padding: 12px 16px; font-size: 13px; font-weight: 500; color: #5f6368; border-bottom: 1px solid #e8eaed; }
.placeholder { padding: 24px; font-size: 14px; color: #9aa0a6; flex: 1; }
.panel-right { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
</style>
