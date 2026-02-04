<template>
  <span class="oauth-icon-wrap" :class="iconClass" aria-hidden="true">{{ letter }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  provider: { type: String, default: '' },
  displayName: { type: String, default: '' },
})

const letter = computed(() => {
  const name = props.displayName || props.provider || ''
  const first = name.trim().charAt(0)
  return first ? first.toUpperCase() : '?'
})

const id = computed(() => (props.provider || '').toLowerCase().replace(/\s/g, ''))

const iconClass = computed(() => {
  if (id.value === 'github') return 'oauth-icon--github'
  if (id.value === 'google') return 'oauth-icon--google'
  if (id.value === 'wechat' || id.value === 'weixin') return 'oauth-icon--wechat'
  if (id.value === 'alipay') return 'oauth-icon--alipay'
  return 'oauth-icon--default'
})
</script>

<style scoped>
.oauth-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  border-radius: 50%;
  transition: transform 0.2s, box-shadow 0.2s;
}
.oauth-icon--github {
  background: linear-gradient(145deg, #333 0%, #24292e 100%);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.oauth-icon--google {
  background: linear-gradient(145deg, #4285f4 0%, #3367d6 100%);
  box-shadow: 0 1px 3px rgba(66, 133, 244, 0.35);
}
.oauth-icon--wechat {
  background: linear-gradient(145deg, #09bb07 0%, #07a306 100%);
  box-shadow: 0 1px 3px rgba(9, 187, 7, 0.35);
}
.oauth-icon--alipay {
  background: linear-gradient(145deg, #1677ff 0%, #0958d9 100%);
  box-shadow: 0 1px 3px rgba(22, 119, 255, 0.35);
}
.oauth-icon--default {
  background: linear-gradient(145deg, #5f6368 0%, #3c4043 100%);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
</style>
