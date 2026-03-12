import { ref, shallowRef, onUnmounted } from 'vue'
import { getAgentWorkerWsBase } from '../api/requestAgentWorker.js'

const HEARTBEAT_INTERVAL_MS = 30 * 1000
const IDLE_STOP_PING_MS = 1800 * 1000

function buildWsUrl(sessionId, wsBase) {
  const base = wsBase || getAgentWorkerWsBase()
  if (!base) return ''
  const u = base.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://')
  const root = u.endsWith('/') ? u.slice(0, -1) : u
  return `${root}/api/v1/websocket/${encodeURIComponent(sessionId)}`
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

  function connect(sessionId, onMessage) {
    if (!sessionId) return
    disconnect()
    messageHandler = onMessage
    const url = buildWsUrl(sessionId)
    if (!url) {
      if (onMessage) onMessage({ message_type: 'connect_error', content: 'WebSocket 地址未配置' })
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
        const pong = data.type === 'pong' || data.message_type === 'pong'
        if (pong) return
        if (messageHandler) messageHandler(data)
      } catch {
        if (messageHandler) messageHandler({ type: 'message', content: event.data })
      }
    }

    socket.onclose = () => {
      clearTimers()
      connected.value = false
      ws.value = null
      if (messageHandler) messageHandler({ message_type: 'disconnect', content: '' })
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

  /** payload: content (必填), user_id?, agent_type?, llm_provider?, llm_model?，可选不传则用会话已有值 */
  function send(payload) {
    markActivity()
    const s = ws.value
    if (!s || s.readyState !== WebSocket.OPEN) return false
    try {
      const body = { content: payload.content ?? '' }
      if (payload.user_id != null && payload.user_id !== '') body.user_id = payload.user_id
      if (payload.agent_type != null && payload.agent_type !== '') body.agent_type = payload.agent_type
      if (payload.llm_provider != null && payload.llm_provider !== '') body.llm_provider = payload.llm_provider
      if (payload.llm_model != null && payload.llm_model !== '') body.llm_model = payload.llm_model
      s.send(JSON.stringify(body))
      return true
    } catch {
      return false
    }
  }

  function ensureConnected(sessionId, onMessage) {
    if (connected.value && ws.value && ws.value.readyState === WebSocket.OPEN) return true
    connect(sessionId, onMessage)
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
