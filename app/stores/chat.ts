import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Server, Channel, Message, FriendRelation, DmConversation, DmMessage } from '~/types/chat'

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

  // Amis & DMs State
  const activeDmUserId = ref<string | null>(null)
  const activeHomeTab = ref<'friends' | 'chat'>('friends')
  const friends = ref<{ friends: FriendRelation[], pendingIncoming: FriendRelation[], pendingOutgoing: FriendRelation[] }>({
    friends: [],
    pendingIncoming: [],
    pendingOutgoing: []
  })
  const dmConversations = ref<DmConversation[]>([])
  const dmMessages = ref<DmMessage[]>([])
  const isLoadingFriends = ref(false)
  const isLoadingDms = ref(false)
  const isLoadingDmMessages = ref(false)

  // Presence State
  const onlineUserIds = ref<Set<string>>(new Set())

  // Typing Indicator State: channelId -> array of { userId, userName, timeoutId }
  interface TypingUser { userId: string, userName: string, timeoutId: ReturnType<typeof setTimeout> }
  const typingUsers = ref<Map<string, TypingUser[]>>(new Map())

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
    activeDmUserId.value = null
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

    socket.onopen = async () => {
      console.log('[WS] Connected to server')
      if (activeChannelId.value) {
        subscribeToChannel(activeChannelId.value)
      }
      // Hydrate presence state
      try {
        const res = await $fetch<{ onlineUserIds: string[] }>('/api/users/online')
        onlineUserIds.value = new Set(res.onlineUserIds)
      } catch (e) {
        console.error('[WS] Failed to fetch online users:', e)
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
        } else if (data.type === 'dm:message:new' && data.message) {
          const currentUserId = useUserSession().user.value?.id
          if (currentUserId) {
            const expectedDmRoomId = [currentUserId, activeDmUserId.value].sort().join('_')
            if (data.dmRoomId === expectedDmRoomId) {
              if (!dmMessages.value.some(m => m.id === data.message.id)) {
                dmMessages.value.push(data.message)
              }
            }
          }
          fetchDms() // Rafraîchir la liste de DMs pour remonter la convo en haut
        } else if (data.type === 'friends:update') {
          fetchFriends()
        } else if (data.type === 'dms:update') {
          fetchDms()

        // --- Presence ---
        } else if (data.type === 'presence' && data.userId) {
          if (data.status === 'online') {
            onlineUserIds.value = new Set([...onlineUserIds.value, data.userId])
          } else {
            const next = new Set(onlineUserIds.value)
            next.delete(data.userId)
            onlineUserIds.value = next
          }

        // --- Typing Indicator ---
        } else if (data.type === 'typing' && data.userId && data.userName && data.channelId) {
          handleTypingStart(data.channelId, data.userId, data.userName)
        } else if (data.type === 'typing:stop' && data.userId && data.channelId) {
          handleTypingStop(data.channelId, data.userId)
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

  // --- Typing Indicator Helpers ---

  function handleTypingStart(channelId: string, userId: string, userName: string) {
    const current = typingUsers.value.get(channelId) ?? []
    // Clear existing timeout for this user
    const existing = current.find(u => u.userId === userId)
    if (existing) clearTimeout(existing.timeoutId)
    // Set a 4-second auto-cleanup in case typing:stop is never received
    const timeoutId = setTimeout(() => handleTypingStop(channelId, userId), 4000)
    const updated = current.filter(u => u.userId !== userId)
    updated.push({ userId, userName, timeoutId })
    typingUsers.value = new Map(typingUsers.value).set(channelId, updated)
  }

  function handleTypingStop(channelId: string, userId: string) {
    const current = typingUsers.value.get(channelId) ?? []
    const existing = current.find(u => u.userId === userId)
    if (existing) clearTimeout(existing.timeoutId)
    const updated = current.filter(u => u.userId !== userId)
    const next = new Map(typingUsers.value)
    if (updated.length === 0) {
      next.delete(channelId)
    } else {
      next.set(channelId, updated)
    }
    typingUsers.value = next
  }

  function getTypingUsers(channelId: string): string[] {
    return (typingUsers.value.get(channelId) ?? []).map(u => u.userName)
  }

  // Debounce map: channelId -> timeout handle
  const typingDebounceMap = new Map<string, ReturnType<typeof setTimeout>>()

  function sendTyping(channelId: string) {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) return
    // Send typing:start only if not already in debounce window
    if (!typingDebounceMap.has(channelId)) {
      ws.value.send(JSON.stringify({ type: 'typing:start', channelId }))
    }
    // Reset debounce timer
    clearTimeout(typingDebounceMap.get(channelId))
    const timer = setTimeout(() => {
      stopTyping(channelId)
    }, 3000)
    typingDebounceMap.set(channelId, timer)
  }

  function stopTyping(channelId: string) {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) return
    clearTimeout(typingDebounceMap.get(channelId))
    typingDebounceMap.delete(channelId)
    ws.value.send(JSON.stringify({ type: 'typing:stop', channelId }))
  }

  // Friends & DMs Actions
  async function fetchFriends() {
    isLoadingFriends.value = true
    try {
      friends.value = await $fetch<{ friends: FriendRelation[], pendingIncoming: FriendRelation[], pendingOutgoing: FriendRelation[] }>('/api/friends')
    } catch (e) {
      console.error(e)
    } finally {
      isLoadingFriends.value = false
    }
  }

  async function fetchDms() {
    isLoadingDms.value = true
    try {
      dmConversations.value = await $fetch<DmConversation[]>('/api/dms')
    } catch (e) {
      console.error(e)
    } finally {
      isLoadingDms.value = false
    }
  }

  async function fetchDmMessages(initial = false) {
    if (!activeDmUserId.value) return
    if (initial) {
      isLoadingDmMessages.value = true
    }
    try {
      dmMessages.value = await $fetch<DmMessage[]>(`/api/dms/messages?partnerId=${activeDmUserId.value}`)
    } catch (e) {
      console.error(e)
    } finally {
      if (initial) {
        isLoadingDmMessages.value = false
      }
    }
  }

  async function sendDmMessage(content: string) {
    if (!activeDmUserId.value || !content.trim()) return
    try {
      const msg = await $fetch<DmMessage>('/api/dms/messages', {
        method: 'POST',
        body: { receiverId: activeDmUserId.value, content }
      })
      if (!dmMessages.value.some(m => m.id === msg.id)) {
        dmMessages.value.push(msg)
      }
      fetchDms() // Rafraîchir pour remonter la convo
    } catch (e) {
      console.error(e)
    }
  }

  async function sendFriendRequest(emailOrUserId: string, isEmail = false) {
    const body: Record<string, string> = {}
    if (isEmail) {
      body.email = emailOrUserId
    } else {
      body.userId = emailOrUserId
    }
    const res = await $fetch<{ message: string }>('/api/friends/request', {
      method: 'POST',
      body
    })
    await fetchFriends()
    return res
  }

  async function acceptFriendRequest(friendshipId: string) {
    try {
      await $fetch('/api/friends/accept', {
        method: 'POST',
        body: { friendshipId }
      })
      await fetchFriends()
      await fetchDms()
    } catch (e) {
      console.error(e)
    }
  }

  async function declineFriendRequest(friendshipId: string) {
    try {
      await $fetch('/api/friends/decline', {
        method: 'POST',
        body: { friendshipId }
      })
      await fetchFriends()
      await fetchDms()
    } catch (e) {
      console.error(e)
    }
  }

  async function selectDmPartner(partnerId: string) {
    activeServerId.value = null
    activeChannelId.value = null
    activeDmUserId.value = partnerId
    activeHomeTab.value = 'chat'
    dmMessages.value = []

    await fetchDmMessages(true)

    // S'abonner via WebSocket
    const currentUserId = useUserSession().user.value?.id
    if (currentUserId) {
      const dmRoomId = [currentUserId, partnerId].sort().join('_')
      subscribeToChannel(`dm:${dmRoomId}`)
    }
  }

  function selectHome() {
    activeServerId.value = null
    activeChannelId.value = null
    activeDmUserId.value = null
    activeHomeTab.value = 'friends'
    fetchFriends()
    fetchDms()
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
    activeDmUserId,
    activeHomeTab,
    friends,
    dmConversations,
    dmMessages,
    isLoadingFriends,
    isLoadingDms,
    isLoadingDmMessages,
    // Presence
    onlineUserIds,
    // Typing
    typingUsers,
    getTypingUsers,
    sendTyping,
    stopTyping,
    fetchServers,
    fetchChannels,
    fetchMessages,
    sendMessage,
    deleteMessage,
    selectServer,
    selectChannel,
    initWebSocket,
    subscribeToChannel,
    fetchFriends,
    fetchDms,
    fetchDmMessages,
    sendDmMessage,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    selectDmPartner,
    selectHome
  }
})
