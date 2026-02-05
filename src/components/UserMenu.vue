<template>
  <div ref="menuRef" class="user-menu-wrap">
    <div class="user-menu-card">
      <div class="user-info-row">
        <img
          v-if="avatarUrlValue"
          :src="avatarUrlValue"
          alt="头像"
          class="menu-avatar-img"
        />
        <span v-else class="menu-avatar">{{ avatarLetter }}</span>
        <div class="menu-name-wrap">
          <span class="menu-username">{{ userDisplayName }}</span>
          <span v-if="user?.email" class="menu-email">{{ user.email }}</span>
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
      <button type="button" class="menu-item" @click="onChangePassword">
        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
        修改密码
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

const emit = defineEmits(['edit', 'changePassword', 'logout'])

const { user, userDisplayName, avatarUrl, loadAvatar, avatarObjectUrls } = useAuth()

const avatarUrlValue = computed(() => {
  const u = user.value
  const uid = u?.id ?? u?.user_id
  if (!uid) return ''
  loadAvatar(uid)
  return avatarObjectUrls.value[uid] ?? avatarUrl(uid) ?? ''
})

const avatarLetter = computed(() => {
  const name = userDisplayName.value
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
})

function onEdit() {
  emit('edit')
}

function onChangePassword() {
  emit('changePassword')
}

function onLogout() {
  emit('logout')
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
.menu-avatar,
.menu-avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}
.menu-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  background: #00bcd4;
}
.menu-avatar-img {
  object-fit: cover;
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
