import { ref, shallowRef, onUnmounted } from 'vue'
import { getAgentWorkerWsBase } from '../api/requestAgentWorker.js'

const HEARTBEAT_INTERVAL_MS = 30 * 1000
const IDLE_STOP_PING_MS = 1800 * 1000

function buildWsUrl(agentType, sessionId, wsBase) {
  const base = wsBase || getAgentWorkerWsBase()
  if (!base) return ''
  const u = base.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://')
  const root = u.endsWith('/') ? u.slice(0, -1) : u
  return `${root}/${encodeURIComponent(agentType)}/${encodeURIComponent(sessionId)}`
}

export function useAgentWebSocket() {
  const ws = shallowRef(null)
  const connected = ref(false)
  const lastActivityAt = ref(0)
  let pingTimer = null
  let idleCheckTimer = null
  let messageHandler = null

  function markActivity() {
    lastActivityAt.value = Date.now()
  }

  function clearTimers() {
    if (pingTimer) {
      clearInterval(pingTimer)
      pingTimer = null
    }
    if (idleCheckTimer) {
      clearInterval(idleCheckTimer)
      idleCheckTimer = null
    }
  }

  function disconnect() {
    clearTimers()
    const s = ws.value
    if (s) {
      try {
        s.close()
      } catch (_) {}
      ws.value = null
    }
    connected.value = false
  }

  function connect(agentType, sessionId, onMessage) {
    if (!agentType || !sessionId) return
    disconnect()
    messageHandler = onMessage
    const url = buildWsUrl(agentType, sessionId)
    if (!url) {
      if (onMessage) onMessage({ type: 'error', content: 'WebSocket 地址未配置' })
      return
    }
    const socket = new WebSocket(url)
    ws.value = socket

    socket.onopen = () => {
      connected.value = true
      markActivity()
      startPing()
      startIdleCheck()
    }

    socket.onmessage = (event) => {
      markActivity()
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'pong') return
        if (messageHandler) messageHandler(data)
      } catch {
        if (messageHandler) messageHandler({ type: 'message', content: event.data })
      }
    }

    socket.onclose = () => {
      clearTimers()
      connected.value = false
      ws.value = null
      if (messageHandler) messageHandler({ type: 'disconnected' })
    }

    socket.onerror = () => {
      if (messageHandler) messageHandler({ type: 'error', content: 'WebSocket 连接错误' })
    }
  }

  function startPing() {
    clearTimers()
    pingTimer = setInterval(() => {
      const s = ws.value
      if (!s || s.readyState !== WebSocket.OPEN) return
      const idle = Date.now() - lastActivityAt.value
      if (idle >= IDLE_STOP_PING_MS) {
        clearTimers()
        return
      }
      try {
        s.send(JSON.stringify({ type: 'ping' }))
      } catch (_) {}
    }, HEARTBEAT_INTERVAL_MS)

    idleCheckTimer = setInterval(() => {
      const idle = Date.now() - lastActivityAt.value
      if (idle >= IDLE_STOP_PING_MS) {
        clearTimers()
        const s = ws.value
        if (s && s.readyState === WebSocket.OPEN) {
          try {
            s.close()
          } catch (_) {}
        }
      }
    }, 10000)
  }

  function startIdleCheck() {}

  function send(content, llmProvider = '', llmModel = '') {
    markActivity()
    const s = ws.value
    if (!s || s.readyState !== WebSocket.OPEN) return false
    try {
      s.send(JSON.stringify({
        content,
        llm_provider: llmProvider || undefined,
        llm_model: llmModel || undefined,
      }))
      return true
    } catch {
      return false
    }
  }

  function ensureConnected(agentType, sessionId, onMessage) {
    if (connected.value && ws.value && ws.value.readyState === WebSocket.OPEN) return true
    connect(agentType, sessionId, onMessage)
    return false
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    ws,
    connected,
    lastActivityAt,
    connect,
    disconnect,
    send,
    markActivity,
    ensureConnected,
  }
}
