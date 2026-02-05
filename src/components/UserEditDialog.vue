<template>
  <div class="edit-overlay" @click.self="emit('close')">
    <div class="edit-card">
      <div class="edit-header">
        <h2 class="edit-title">修改资料</h2>
        <button type="button" class="close-btn" aria-label="关闭" @click="emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <form class="edit-form" @submit.prevent="handleSubmit">
        <div class="field">
          <label>用户名</label>
          <input v-model="form.username" type="text" disabled class="disabled" />
        </div>
        <div class="field">
          <label for="edit-desc">个人描述</label>
          <textarea
            id="edit-desc"
            v-model="form.description"
            rows="3"
            placeholder="选填"
          />
        </div>
        <div class="field avatar-field">
          <label>头像</label>
          <div class="avatar-row">
            <div class="avatar-preview">
              <img v-if="avatarPreview" :src="avatarPreview" alt="头像" class="avatar-img" />
              <span v-else class="avatar-letter">{{ avatarLetter }}</span>
            </div>
            <div class="avatar-actions">
              <input
                ref="avatarInputRef"
                type="file"
                accept="image/*"
                class="avatar-input"
                @change="onAvatarSelect"
              />
              <button type="button" class="avatar-btn" @click="triggerAvatarInput">选择图片</button>
              <span v-if="avatarUploading" class="avatar-status">上传中…</span>
              <span v-else-if="avatarError" class="avatar-error">{{ avatarError }}</span>
            </div>
          </div>
        </div>
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
        <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '保存中…' : '保存' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useAuth } from '../composables/useAuth.js'

const props = defineProps({
  user: { type: Object, default: null },
})

const emit = defineEmits(['close', 'success'])

const { user, updateUser, uploadAvatarFile, avatarUrl, loadAvatar, avatarObjectUrls, revokeAvatar } = useAuth()

const form = ref({
  username: '',
  description: '',
})
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const avatarInputRef = ref(null)
const avatarUploading = ref(false)
const avatarError = ref('')
const pendingAvatarFile = ref(null)
const pendingAvatarPreviewUrl = ref('')
const initialDescription = ref('')

const avatarVersion = ref(0)
const avatarPreview = computed(() => {
  if (pendingAvatarPreviewUrl.value) return pendingAvatarPreviewUrl.value
  const u = props.user || user.value
  const uid = u?.id ?? u?.user_id
  if (!uid) return ''
  loadAvatar(uid)
  const url = avatarObjectUrls.value[uid] ?? avatarUrl(uid)
  if (!url) return ''
  return url + (avatarVersion.value ? `?t=${avatarVersion.value}` : '')
})

const avatarLetter = computed(() => {
  const u = props.user || user.value
  if (!u) return '?'
  const name = u.user_name ?? u.userName ?? u.username ?? ''
  const s = typeof name === 'string' ? name.trim() : ''
  return s ? String(s).charAt(0).toUpperCase() : '?'
})

watch(
  () => props.user || user.value,
  (u) => {
    if (u) {
      const raw = u.description ?? u.bio ?? u.user_full_name ?? u.userFullName ?? ''
      const desc = typeof raw === 'string' ? raw.trim() : ''
      form.value = {
        username: u.user_name ?? u.userName ?? u.username ?? '',
        description: desc,
      }
      initialDescription.value = desc
    }
    errorMsg.value = ''
    avatarError.value = ''
    successMsg.value = ''
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (pendingAvatarPreviewUrl.value) {
    URL.revokeObjectURL(pendingAvatarPreviewUrl.value)
    pendingAvatarPreviewUrl.value = ''
  }
})

function triggerAvatarInput() {
  avatarInputRef.value?.click()
}

function onAvatarSelect(e) {
  const file = e.target?.files?.[0]
  if (!file || !file.type.startsWith('image/')) {
    avatarError.value = '请选择图片文件'
    return
  }
  avatarError.value = ''
  if (pendingAvatarPreviewUrl.value) URL.revokeObjectURL(pendingAvatarPreviewUrl.value)
  pendingAvatarFile.value = file
  pendingAvatarPreviewUrl.value = URL.createObjectURL(file)
  if (avatarInputRef.value) avatarInputRef.value.value = ''
}

async function handleSubmit() {
  errorMsg.value = ''
  avatarError.value = ''
  successMsg.value = ''
  loading.value = true
  let didSomething = false
  try {
    if (pendingAvatarFile.value) {
      avatarUploading.value = true
      try {
        await uploadAvatarFile(pendingAvatarFile.value)
        const uid = (props.user || user.value)?.id ?? (props.user || user.value)?.user_id
        if (uid) revokeAvatar(uid)
        avatarVersion.value++
        emit('success')
        didSomething = true
      } catch (err) {
        avatarError.value = err?.data?.detail || err?.message || '上传失败'
        loading.value = false
        return
      } finally {
        avatarUploading.value = false
        if (pendingAvatarPreviewUrl.value) {
          URL.revokeObjectURL(pendingAvatarPreviewUrl.value)
          pendingAvatarPreviewUrl.value = ''
        }
        pendingAvatarFile.value = null
      }
    }
    const rawDesc = form.value.description !== undefined ? form.value.description : ''
    const currentDesc = typeof rawDesc === 'string' ? rawDesc.trim() : ''
    const descriptionChanged = currentDesc !== initialDescription.value
    if (descriptionChanged) {
      const body = { description: currentDesc }
      await updateUser(body)
      initialDescription.value = currentDesc
      didSomething = true
    }
    successMsg.value = '修改成功'
    setTimeout(() => {
      if (didSomething) emit('success')
      emit('close')
    }, 1500)
  } catch (e) {
    errorMsg.value = e?.data?.detail || e?.message || '保存失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.edit-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
}
.edit-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: 24px 32px 32px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
}
.edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.edit-title {
  font-size: 18px;
  font-weight: 500;
  color: #202124;
}
.close-btn {
  padding: 4px;
  color: #5f6368;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 50%;
}
.close-btn:hover {
  background: #f1f3f4;
  color: #202124;
}
.edit-form .field {
  margin-bottom: 20px;
}
.avatar-field .avatar-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.avatar-preview {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  background: #e8eaed;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-letter {
  font-size: 24px;
  color: #5f6368;
}
.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.avatar-input {
  display: none;
}
.avatar-btn {
  padding: 6px 12px;
  font-size: 14px;
  color: #1a73e8;
  background: none;
  border: 1px solid #1a73e8;
  border-radius: 6px;
  cursor: pointer;
}
.avatar-btn:hover {
  background: #e8f0fe;
}
.avatar-status,
.avatar-error {
  font-size: 12px;
}
.avatar-error {
  color: #d93025;
}
.edit-form input,
.edit-form textarea {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #dadce0;
  border-radius: 6px;
  box-sizing: border-box;
}
.edit-form input.disabled {
  background: #f1f3f4;
  color: #5f6368;
}
.edit-form label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #202124;
}
.error-msg {
  margin-bottom: 12px;
  font-size: 14px;
  color: #d93025;
}
.success-msg {
  margin-bottom: 12px;
  font-size: 14px;
  color: #1e8e3e;
}
.submit-btn {
  width: 100%;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background: #1a73e8;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.submit-btn:hover:not(:disabled) {
  background: #1765cc;
}
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
