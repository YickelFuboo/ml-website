<template>
  <div class="qa-overlay" @click.self="emit('close')">
    <div class="qa-dialog">
      <div class="qa-dialog-header">
        <h2 class="qa-dialog-title">知识问答</h2>
        <button type="button" class="qa-close" aria-label="关闭" @click="emit('close')">×</button>
      </div>
      <div class="qa-dialog-body">
        <div class="qa-panel-left">
          <div class="qa-panel-title">选择知识库</div>
          <p v-if="!tenantId" class="qa-hint">请先在顶部选择产品版本</p>
          <template v-else>
            <div v-if="kbLoading" class="qa-hint">加载中…</div>
            <div v-else-if="!kbList.length" class="qa-hint">该版本下暂无知识库</div>
            <ul v-else class="qa-kb-list">
              <li
                v-for="kb in kbList"
                :key="kb.id"
                class="qa-kb-item"
                :class="{ selected: selectedKbIds.includes(kb.id) }"
                @click="toggleKb(kb.id)"
              >
                <span class="qa-kb-name">{{ kb.name || kb.id }}</span>
              </li>
            </ul>
            <p class="qa-mode-hint">{{ modeHint }}</p>
          </template>
        </div>
        <div class="qa-panel-right">
          <div class="qa-chat-messages" ref="messagesRef">
            <div v-if="!messages.length" class="qa-chat-empty">输入问题开始对话</div>
            <div
              v-for="(msg, idx) in messages"
              :key="idx"
              class="qa-msg"
              :class="msg.role"
            >
              <span class="qa-msg-role">{{ msg.role === 'user' ? '我' : '助手' }}</span>
              <div class="qa-msg-content">{{ msg.content }}</div>
            </div>
            <div v-if="sending" class="qa-msg assistant">
              <span class="qa-msg-role">助手</span>
              <div class="qa-msg-content">{{ streamBuffer || '…' }}</div>
            </div>
          </div>
          <div class="qa-chat-input-wrap">
            <div class="qa-chat-options">
              <label class="qa-option">
                <input v-model="enableWebSearch" type="checkbox" />
                <span>联网</span>
              </label>
            </div>
            <div class="qa-input-row">
              <textarea
                v-model="inputText"
                class="qa-input"
                placeholder="输入问题…"
                rows="2"
                @keydown.enter.exact.prevent="send"
              />
              <button
                type="button"
                class="qa-send-btn"
                :disabled="sending || !inputText.trim()"
                @click="send"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { listKbsByTenant } from '../api/knowledgebase.js'
import { kbQuery } from '../api/qa.js'
import { chat } from '../api/llms.js'

const props = defineProps({
  tenantId: { type: String, default: '' },
})

const emit = defineEmits(['close'])

const tenantId = computed(() => props.tenantId)
const kbList = ref([])
const kbLoading = ref(false)
const selectedKbIds = ref([])
const messages = ref([])
const inputText = ref('')
const sending = ref(false)
const streamBuffer = ref('')
const enableWebSearch = ref(false)
const messagesRef = ref(null)

const modeHint = computed(() => {
  if (selectedKbIds.value.length) {
    return `已选 ${selectedKbIds.value.length} 个知识库，将使用知识库问答`
  }
  return '未选知识库时将使用模型直接问答'
})

function toggleKb(id) {
  const idx = selectedKbIds.value.indexOf(id)
  if (idx === -1) {
    selectedKbIds.value = [...selectedKbIds.value, id]
  } else {
    selectedKbIds.value = selectedKbIds.value.filter((k) => k !== id)
  }
}

async function loadKbs() {
  if (!tenantId.value) {
    kbList.value = []
    return
  }
  kbLoading.value = true
  try {
    const res = await listKbsByTenant(tenantId.value, { items_per_page: 200 })
    kbList.value = res?.items ?? []
  } catch {
    kbList.value = []
  } finally {
    kbLoading.value = false
  }
}

watch(tenantId, loadKbs, { immediate: true })

async function send() {
  const text = inputText.value.trim()
  if (!text || sending.value) return
  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  sending.value = true
  streamBuffer.value = ''
  scrollToBottom()

  const hasKb = selectedKbIds.value.length > 0
  const history = messages.value.slice(0, -1).map((m) => ({ role: m.role, content: m.content }))

  try {
    if (hasKb) {
      const res = await kbQuery(tenantId.value, {
        question: text,
        kb_ids: selectedKbIds.value,
        history_messages: history.length ? history : undefined,
        enable_web_search: enableWebSearch.value,
      })
      const answer = res?.answer ?? '无回复'
      messages.value.push({ role: 'assistant', content: answer })
    } else {
      const res = await chat({
        user_prompt: '',
        user_question: text,
        system_prompt: enableWebSearch.value ? '请结合联网信息回答用户问题。' : undefined,
      })
      const answer = res?.content ?? '无回复'
      messages.value.push({ role: 'assistant', content: answer })
    }
  } catch (e) {
    const msg = e?.message || '请求失败'
    messages.value.push({ role: 'assistant', content: `错误：${msg}` })
  } finally {
    sending.value = false
    streamBuffer.value = ''
    scrollToBottom()
  }
}

function scrollToBottom() {
  setTimeout(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  }, 50)
}
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
  width: 90%;
  max-width: 960px;
  height: 80vh;
  max-height: 720px;
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
  gap: 0;
}
.qa-panel-left {
  width: 240px;
  flex-shrink: 0;
  border-right: 1px solid #e8eaed;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.qa-panel-title {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #202124;
  border-bottom: 1px solid #e8eaed;
}
.qa-hint {
  padding: 16px;
  font-size: 13px;
  color: #9aa0a6;
}
.qa-kb-list {
  list-style: none;
  margin: 0;
  padding: 8px 0;
  overflow: auto;
}
.qa-kb-item {
  padding: 8px 16px;
  font-size: 13px;
  color: #202124;
  cursor: pointer;
}
.qa-kb-item:hover {
  background: #f1f3f4;
}
.qa-kb-item.selected {
  background: #e8f0fe;
  color: #1a73e8;
}
.qa-kb-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}
.qa-mode-hint {
  margin-top: auto;
  padding: 12px 16px;
  font-size: 12px;
  color: #9aa0a6;
  border-top: 1px solid #e8eaed;
}
.qa-panel-right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.qa-chat-messages {
  flex: 1;
  overflow: auto;
  padding: 16px;
}
.qa-chat-empty {
  color: #9aa0a6;
  font-size: 14px;
  text-align: center;
  padding: 24px;
}
.qa-msg {
  margin-bottom: 16px;
}
.qa-msg-role {
  font-size: 12px;
  color: #5f6368;
  margin-bottom: 4px;
  display: block;
}
.qa-msg-content {
  font-size: 14px;
  color: #202124;
  white-space: pre-wrap;
  word-break: break-word;
}
.qa-chat-input-wrap {
  flex-shrink: 0;
  padding: 12px 16px;
  border-top: 1px solid #e8eaed;
  background: #f8fafc;
}
.qa-chat-options {
  margin-bottom: 8px;
}
.qa-option {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #5f6368;
  cursor: pointer;
}
.qa-input-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}
.qa-input {
  flex: 1;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  font-family: inherit;
}
.qa-input:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
}
.qa-send-btn {
  flex-shrink: 0;
  height: 44px;
  padding: 0 20px;
  font-size: 14px;
  color: #fff;
  background: #5f6368;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.qa-send-btn:hover:not(:disabled) {
  background: #80868b;
}
.qa-send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
