import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Server, Channel, Message } from '~/types/chat'

export const useChatStore = defineStore('chat', () => {
  // State
  const servers = ref<Server[]>([])
  const channels = ref<Channel[]>([])
  const messages = ref<Message[]>([])
  const activeServerId = ref<string | null>(null)
  const activeChannelId = ref<string | null>(null)
  const ws = ref<WebSocket | null>(null)
  const isLoadingServers = ref(true)
  const isLoadingChannels = ref(false)
  const isLoadingMessages = ref(false)

  // Actions
  async function fetchServers() {
    isLoadingServers.value = true
    try {
      servers.value = await $fetch<Server[]>('/api/servers')
      if (servers.value.length > 0 && !activeServerId.value) {
        activeServerId.value = servers.value[0]!.id
        await fetchChannels()
      }
    } catch (e) {
      console.error(e)
    } finally {
      isLoadingServers.value = false
    }
  }

  async function fetchChannels() {
    if (!activeServerId.value) return
    isLoadingChannels.value = true
    try {
      channels.value = await $fetch<Channel[]>(`/api/channels?serverId=${activeServerId.value}`)
      if (channels.value.length > 0 && (!activeChannelId.value || !channels.value.find(c => c.id === activeChannelId.value))) {
        activeChannelId.value = channels.value[0]!.id
        await fetchMessages(true)
        subscribeToChannel(activeChannelId.value)
      } else if (channels.value.length === 0) {
        activeChannelId.value = null
        subscribeToChannel(null)
      }
    } catch (e) {
      console.error(e)
    } finally {
      isLoadingChannels.value = false
    }
  }

  async function fetchMessages(initial = false) {
    if (!activeChannelId.value) return
    if (initial) {
      isLoadingMessages.value = true
    }
    try {
      messages.value = await $fetch<Message[]>(`/api/messages?channelId=${activeChannelId.value}`)
    } catch (e) {
      console.error(e)
    } finally {
      if (initial) {
        isLoadingMessages.value = false
      }
    }
  }

  async function sendMessage(content: string) {
    if (!activeChannelId.value || !content.trim()) return
    try {
      await $fetch('/api/messages', {
        method: 'POST',
        body: { channelId: activeChannelId.value, content }
      })
    } catch (e) {
      console.error(e)
    }
  }

  async function deleteMessage(messageId: string) {
    try {
      await $fetch('/api/messages', {
        method: 'DELETE',
        body: { messageId }
      })
    } catch (e) {
      console.error(e)
    }
  }

  async function selectServer(serverId: string) {
    activeServerId.value = serverId
    messages.value = []
    await fetchChannels()
  }

  async function selectChannel(channelId: string) {
    activeChannelId.value = channelId
    messages.value = []
    await fetchMessages(true)
    subscribeToChannel(channelId)
  }

  function initWebSocket() {
    if (ws.value) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const wsUrl = `${protocol}//${host}/_ws`

    console.log('[WS] Connecting to:', wsUrl)
    const socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      console.log('[WS] Connected to server')
      if (activeChannelId.value) {
        subscribeToChannel(activeChannelId.value)
      }
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'message:new' && data.message) {
          if (data.message.channelId === activeChannelId.value) {
            if (!messages.value.some(m => m.id === data.message.id)) {
              messages.value.push(data.message)
            }
          }
        } else if (data.type === 'message:delete' && data.messageId) {
          messages.value = messages.value.filter(m => m.id !== data.messageId)
        }
      } catch (e) {
        console.error('[WS] Error processing message:', e)
      }
    }

    socket.onclose = () => {
      console.log('[WS] Disconnected from server. Reconnecting in 3s...')
      ws.value = null
      setTimeout(() => initWebSocket(), 3000)
    }

    socket.onerror = (err) => {
      console.error('[WS] Error:', err)
    }

    ws.value = socket
  }

  function subscribeToChannel(channelId: string | null) {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({ type: 'subscribe', channelId }))
    }
  }

  return {
    servers,
    channels,
    messages,
    activeServerId,
    activeChannelId,
    ws,
    isLoadingServers,
    isLoadingChannels,
    isLoadingMessages,
    fetchServers,
    fetchChannels,
    fetchMessages,
    sendMessage,
    deleteMessage,
    selectServer,
    selectChannel,
    initWebSocket,
    subscribeToChannel
  }
})
