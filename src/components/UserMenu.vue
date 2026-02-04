<template>
  <div ref="menuRef" class="user-menu-wrap">
    <div class="user-menu-card">
      <div class="user-info-row">
        <span class="menu-avatar">{{ avatarLetter }}</span>
        <div class="menu-name-wrap">
          <span class="menu-username">{{ displayName }}</span>
          <span v-if="user && user.email" class="menu-email">{{ user.email }}</span>
        </div>
      </div>
      <div class="menu-divider" />
      <button type="button" class="menu-item" @click="onEdit">
        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        修改资料
      </button>
      <button type="button" class="menu-item logout" @click="onLogout">
        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        退出登录
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuth } from '../composables/useAuth.js'

const emit = defineEmits(['edit', 'logout'])

const { user } = useAuth()

const displayName = computed(() => {
  const u = user.value
  if (!u) return '用户'
  return u.username ?? u.name ?? u.email ?? '用户'
})

const avatarLetter = computed(() => {
  const name = displayName.value
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
})

function onEdit() {
  emit('edit')
}

function onLogout() {
  emit('logout')
}
</script>

<script>
export default {
  inheritAttrs: false,
}
</script>

<style scoped>
.user-menu-wrap {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 200;
  min-width: 240px;
}
.user-menu-card {
  padding: 12px 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.08);
}
.user-info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px 12px;
}
.menu-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  background: #00bcd4;
  border-radius: 50%;
  flex-shrink: 0;
}
.menu-name-wrap {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.menu-username {
  font-size: 15px;
  font-weight: 500;
  color: #202124;
}
.menu-email {
  font-size: 13px;
  color: #5f6368;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.menu-divider {
  height: 1px;
  margin: 0 8px;
  background: rgba(0, 0, 0, 0.08);
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 16px;
  font-size: 14px;
  color: #202124;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}
.menu-item:hover {
  background: #f1f3f4;
}
.menu-item.logout:hover {
  color: #d93025;
}
.menu-icon {
  flex-shrink: 0;
  color: #5f6368;
}
.menu-item.logout .menu-icon {
  color: inherit;
}
</style>
