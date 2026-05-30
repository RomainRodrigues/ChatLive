import type { Server, Channel, Message, FriendRelation, DmConversation, DmMessage } from '~/types/chat'

// ─── WebSocket Reconnection Config ───────────────────
const WS_MIN_DELAY = 1_000 // 1s
const WS_MAX_DELAY = 30_000 // 30s
const WS_HEARTBEAT_INTERVAL = 30_000 // 30s

export const useChatStore = defineStore('chat', () => {
  // ─── Servers & Channels ───────────────────────────
  const servers = ref<Server[]>([])
  const channels = ref<Channel[]>([])
  const messages = ref<Message[]>([])
  const activeServerId = ref<string | null>(null)
  const activeChannelId = ref<string | null>(null)
  const isLoadingServers = ref(true)
  const isLoadingChannels = ref(false)
  const isLoadingMessages = ref(false)
  const isLoadingMoreMessages = ref(false)
  const hasMoreMessages = ref(false)
  const isMobileSidebarOpen = ref(false)

  // ─── Friends & DMs ───────────────────────────────
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
  const isLoadingMoreDmMessages = ref(false)
  const hasMoreDmMessages = ref(false)

  // ─── Presence ────────────────────────────────────
  const onlineUserIds = ref<Set<string>>(new Set())

  // ─── Typing Indicators ───────────────────────────
  interface TypingUser { userId: string, userName: string, timeoutId: ReturnType<typeof setTimeout> }
  const typingUsers = ref<Map<string, TypingUser[]>>(new Map())
  const typingDebounceMap = new Map<string, ReturnType<typeof setTimeout>>()

  // ─── WebSocket State ─────────────────────────────
  const ws = ref<WebSocket | null>(null)
  let reconnectDelay = WS_MIN_DELAY
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  let isIntentionallyClosed = false

  // ─── DMs debounce (avoid re-fetching on every WS message) ───
  let dmFetchDebounceTimer: ReturnType<typeof setTimeout> | null = null
  function debouncedFetchDms() {
    if (dmFetchDebounceTimer) clearTimeout(dmFetchDebounceTimer)
    dmFetchDebounceTimer = setTimeout(() => fetchDms(), 1500)
  }

  // ─── Server & Channel Actions ─────────────────────

  async function fetchServers() {
    isLoadingServers.value = true
    try {
      servers.value = await $fetch<Server[]>('/api/servers')
      if (servers.value.length > 0 && !activeServerId.value) {
        const firstId = servers.value[0]?.id
        if (firstId) {
          activeServerId.value = firstId
          await fetchChannels()
        }
      }
    } catch (e) {
      handleApiError(e, 'Impossible de charger les serveurs.')
    } finally {
      isLoadingServers.value = false
    }
  }

  async function fetchChannels() {
    if (!activeServerId.value) return
    isLoadingChannels.value = true
    try {
      channels.value = await $fetch<Channel[]>(`/api/channels?serverId=${activeServerId.value}`)
      const channelExists = activeChannelId.value && channels.value.find(c => c.id === activeChannelId.value)
      if (channels.value.length > 0 && !channelExists) {
        const firstId = channels.value[0]?.id
        if (firstId) {
          activeChannelId.value = firstId
          await fetchMessages(true)
          subscribeToChannel(firstId)
        }
      } else if (channels.value.length === 0) {
        activeChannelId.value = null
        subscribeToChannel(null)
      }
    } catch (e) {
      handleApiError(e, 'Impossible de charger les salons.')
    } finally {
      isLoadingChannels.value = false
    }
  }

  async function fetchMessages(initial = false, loadMore = false) {
    if (!activeChannelId.value) return
    if (initial) {
      isLoadingMessages.value = true
      hasMoreMessages.value = false
    }
    if (loadMore) isLoadingMoreMessages.value = true

    try {
      const beforeParam = loadMore && messages.value.length > 0
        ? `&before=${new Date(messages.value[0]!.createdAt).toISOString()}`
        : ''
      const res = await $fetch<{ messages: Message[], hasMore: boolean }>(`/api/messages?channelId=${activeChannelId.value}${beforeParam}`)

      if (loadMore) {
        messages.value = [...res.messages, ...messages.value]
      } else {
        messages.value = res.messages
      }
      hasMoreMessages.value = res.hasMore
    } catch (e) {
      handleApiError(e, 'Impossible de charger les messages.')
    } finally {
      if (initial) isLoadingMessages.value = false
      if (loadMore) isLoadingMoreMessages.value = false
    }
  }

  async function sendMessage(content: string) {
    if (!activeChannelId.value || !content.trim()) return

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const currentUser = useUserSession().user.value
    if (currentUser) {
      const tempMessage: Message = {
        id: tempId,
        content,
        createdAt: new Date().toISOString(),
        userId: currentUser.id,
        channelId: activeChannelId.value,
        user: {
          id: currentUser.id,
          name: currentUser.name || 'Moi',
          avatarUrl: currentUser.avatarUrl || null
        }
      }
      messages.value.push(tempMessage)
    }

    try {
      const msg = await $fetch<Message>('/api/messages', {
        method: 'POST',
        body: { channelId: activeChannelId.value, content }
      })
      // Replace temporary message with actual message from server
      const index = messages.value.findIndex(m => m.id === tempId)
      if (index !== -1) {
        messages.value[index] = msg
      } else if (!messages.value.some(m => m.id === msg.id)) {
        messages.value.push(msg)
      }
    } catch (e) {
      // Remove temporary message on failure
      messages.value = messages.value.filter(m => m.id !== tempId)
      handleApiError(e, 'Impossible d\'envoyer le message.')
    }
  }

  async function deleteMessage(messageId: string) {
    try {
      await $fetch('/api/messages', {
        method: 'DELETE',
        body: { messageId }
      })
    } catch (e) {
      handleApiError(e, 'Impossible de supprimer le message.')
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
    isMobileSidebarOpen.value = false // Close sidebar on mobile
    await fetchMessages(true)
    subscribeToChannel(channelId)
  }

  function toggleMobileSidebar() {
    isMobileSidebarOpen.value = !isMobileSidebarOpen.value
  }

  // ─── WebSocket ───────────────────────────────────

  function initWebSocket() {
    if (ws.value) return
    isIntentionallyClosed = false
    _connect()
  }

  function _connect() {
    if (isIntentionallyClosed) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const socket = new WebSocket(`${protocol}//${host}/_ws`)

    socket.onopen = async () => {
      reconnectDelay = WS_MIN_DELAY // Reset backoff on successful connection
      if (activeChannelId.value) subscribeToChannel(activeChannelId.value)
      // Hydrate presence
      try {
        const res = await $fetch<{ onlineUserIds: string[] }>('/api/users/online')
        onlineUserIds.value = new Set(res.onlineUserIds)
      } catch { /* non-critical */ }
      // Start heartbeat
      _startHeartbeat()
    }

    socket.onmessage = (event) => {
      try {
        _handleMessage(JSON.parse(event.data))
      } catch (e) {
        console.error('[WS] Failed to parse message:', e)
      }
    }

    socket.onclose = (_ev) => {
      _stopHeartbeat()
      ws.value = null
      if (!isIntentionallyClosed) {
        const delay = reconnectDelay
        reconnectDelay = Math.min(reconnectDelay * 2, WS_MAX_DELAY) // Exponential backoff
        reconnectTimer = setTimeout(() => _connect(), delay)
      }
    }

    socket.onerror = () => {
      // onerror is always followed by onclose, reconnect is handled there
    }

    ws.value = socket
  }

  function destroyWebSocket() {
    isIntentionallyClosed = true
    if (reconnectTimer) clearTimeout(reconnectTimer)
    _stopHeartbeat()
    ws.value?.close()
    ws.value = null
  }

  function _startHeartbeat() {
    _stopHeartbeat()
    heartbeatTimer = setInterval(() => {
      if (ws.value?.readyState === WebSocket.OPEN) {
        ws.value.send(JSON.stringify({ type: 'ping' }))
      }
    }, WS_HEARTBEAT_INTERVAL)
  }

  function _stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  function _handleMessage(data: Record<string, unknown>) {
    switch (data.type) {
      case 'message:new': {
        const msg = data.message as Message
        if (msg?.channelId === activeChannelId.value) {
          if (!messages.value.some(m => m.id === msg.id)) {
            messages.value.push(msg)
          }
        }
        break
      }
      case 'message:delete': {
        messages.value = messages.value.filter(m => m.id !== data.messageId)
        break
      }
      case 'dm:message:new': {
        const msg = data.message as DmMessage
        const currentUserId = useUserSession().user.value?.id
        if (currentUserId) {
          const expectedRoomId = [currentUserId, activeDmUserId.value].sort().join('_')
          if (data.dmRoomId === expectedRoomId && !dmMessages.value.some(m => m.id === msg.id)) {
            dmMessages.value.push(msg)
          }
        }
        debouncedFetchDms()
        break
      }
      case 'friends:update':
        fetchFriends()
        break
      case 'dms:update':
        debouncedFetchDms()
        break
      case 'presence': {
        const userId = data.userId as string
        if (data.status === 'online') {
          onlineUserIds.value = new Set([...onlineUserIds.value, userId])
        } else {
          const next = new Set(onlineUserIds.value)
          next.delete(userId)
          onlineUserIds.value = next
        }
        break
      }
      case 'typing':
        if (data.userId && data.userName && data.channelId) {
          _handleTypingStart(data.channelId as string, data.userId as string, data.userName as string)
        }
        break
      case 'typing:stop':
        if (data.userId && data.channelId) {
          _handleTypingStop(data.channelId as string, data.userId as string)
        }
        break
    }
  }

  function subscribeToChannel(channelId: string | null) {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({ type: 'subscribe', channelId }))
    }
  }

  // ─── Typing Indicators ───────────────────────────

  function _handleTypingStart(channelId: string, userId: string, userName: string) {
    const current = typingUsers.value.get(channelId) ?? []
    const existing = current.find(u => u.userId === userId)
    if (existing) clearTimeout(existing.timeoutId)
    const timeoutId = setTimeout(() => _handleTypingStop(channelId, userId), 4000)
    const updated = [...current.filter(u => u.userId !== userId), { userId, userName, timeoutId }]
    typingUsers.value = new Map(typingUsers.value).set(channelId, updated)
  }

  function _handleTypingStop(channelId: string, userId: string) {
    const current = typingUsers.value.get(channelId) ?? []
    const existing = current.find(u => u.userId === userId)
    if (existing) clearTimeout(existing.timeoutId)
    const updated = current.filter(u => u.userId !== userId)
    const next = new Map(typingUsers.value)
    if (updated.length === 0) next.delete(channelId)
    else next.set(channelId, updated)
    typingUsers.value = next
  }

  function getTypingUsers(channelId: string): string[] {
    return (typingUsers.value.get(channelId) ?? []).map(u => u.userName)
  }

  function sendTyping(channelId: string) {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) return
    if (!typingDebounceMap.has(channelId)) {
      ws.value.send(JSON.stringify({ type: 'typing:start', channelId }))
    }
    clearTimeout(typingDebounceMap.get(channelId))
    typingDebounceMap.set(channelId, setTimeout(() => stopTyping(channelId), 3000))
  }

  function stopTyping(channelId: string) {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) return
    clearTimeout(typingDebounceMap.get(channelId))
    typingDebounceMap.delete(channelId)
    ws.value.send(JSON.stringify({ type: 'typing:stop', channelId }))
  }

  // ─── Friends & DMs ───────────────────────────────

  async function fetchFriends() {
    isLoadingFriends.value = true
    try {
      friends.value = await $fetch<{ friends: FriendRelation[], pendingIncoming: FriendRelation[], pendingOutgoing: FriendRelation[] }>('/api/friends')
    } catch (e) {
      handleApiError(e, 'Impossible de charger les amis.')
    } finally {
      isLoadingFriends.value = false
    }
  }

  async function fetchDms() {
    isLoadingDms.value = true
    try {
      dmConversations.value = await $fetch<DmConversation[]>('/api/dms')
    } catch (e) {
      handleApiError(e, 'Impossible de charger les conversations.')
    } finally {
      isLoadingDms.value = false
    }
  }

  async function fetchDmMessages(initial = false, loadMore = false) {
    if (!activeDmUserId.value) return
    if (initial) {
      isLoadingDmMessages.value = true
      hasMoreDmMessages.value = false
    }
    if (loadMore) isLoadingMoreDmMessages.value = true

    try {
      const beforeParam = loadMore && dmMessages.value.length > 0
        ? `&before=${new Date(dmMessages.value[0]!.createdAt).toISOString()}`
        : ''
      const res = await $fetch<{ messages: DmMessage[], hasMore: boolean }>(`/api/dms/messages?partnerId=${activeDmUserId.value}${beforeParam}`)

      if (loadMore) {
        dmMessages.value = [...res.messages, ...dmMessages.value]
      } else {
        dmMessages.value = res.messages
      }
      hasMoreDmMessages.value = res.hasMore
    } catch (e) {
      handleApiError(e, 'Impossible de charger les messages privés.')
    } finally {
      if (initial) isLoadingDmMessages.value = false
      if (loadMore) isLoadingMoreDmMessages.value = false
    }
  }

  async function sendDmMessage(content: string) {
    if (!activeDmUserId.value || !content.trim()) return

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const currentUser = useUserSession().user.value
    if (currentUser) {
      const tempMessage: DmMessage = {
        id: tempId,
        content,
        createdAt: new Date().toISOString(),
        senderId: currentUser.id,
        receiverId: activeDmUserId.value,
        user: {
          id: currentUser.id,
          name: currentUser.name || 'Moi',
          avatarUrl: currentUser.avatarUrl || null
        }
      }
      dmMessages.value.push(tempMessage)
    }

    try {
      const msg = await $fetch<DmMessage>('/api/dms/messages', {
        method: 'POST',
        body: { receiverId: activeDmUserId.value, content }
      })

      // Replace temporary message with actual message from server
      const index = dmMessages.value.findIndex(m => m.id === tempId)
      if (index !== -1) {
        dmMessages.value[index] = msg
      } else if (!dmMessages.value.some(m => m.id === msg.id)) {
        dmMessages.value.push(msg)
      }
      debouncedFetchDms()
    } catch (e) {
      // Remove temporary message on failure
      dmMessages.value = dmMessages.value.filter(m => m.id !== tempId)
      handleApiError(e, 'Impossible d\'envoyer le message privé.')
    }
  }

  async function sendFriendRequest(emailOrUserId: string, isEmail = false) {
    const body: Record<string, string> = isEmail ? { email: emailOrUserId } : { userId: emailOrUserId }
    const res = await $fetch<{ message: string }>('/api/friends/request', { method: 'POST', body })
    await fetchFriends()
    return res
  }

  async function acceptFriendRequest(friendshipId: string) {
    try {
      await $fetch('/api/friends/accept', { method: 'POST', body: { friendshipId } })
      await Promise.all([fetchFriends(), fetchDms()])
    } catch (e) {
      handleApiError(e, 'Impossible d\'accepter la demande d\'ami.')
    }
  }

  async function declineFriendRequest(friendshipId: string) {
    try {
      await $fetch('/api/friends/decline', { method: 'POST', body: { friendshipId } })
      await Promise.all([fetchFriends(), fetchDms()])
    } catch (e) {
      handleApiError(e, 'Impossible de refuser la demande d\'ami.')
    }
  }

  function selectDmPartner(partnerId: string) {
    activeServerId.value = null
    activeChannelId.value = null
    activeDmUserId.value = partnerId
    activeHomeTab.value = 'chat'
    dmMessages.value = []
    isMobileSidebarOpen.value = false // Close sidebar on mobile
    fetchDmMessages(true).then(() => {
      const currentUserId = useUserSession().user.value?.id
      if (currentUserId) {
        subscribeToChannel(`dm:${[currentUserId, partnerId].sort().join('_')}`)
      }
    })
  }

  function selectHome() {
    activeServerId.value = null
    activeChannelId.value = null
    activeDmUserId.value = null
    activeHomeTab.value = 'friends'
    fetchFriends()
    fetchDms()
  }

  // ─── Public API ──────────────────────────────────
  return {
    // State
    servers, channels, messages, activeServerId, activeChannelId, ws,
    isLoadingServers, isLoadingChannels, isLoadingMessages, isLoadingMoreMessages, hasMoreMessages, isMobileSidebarOpen,
    activeDmUserId, activeHomeTab, friends, dmConversations, dmMessages,
    isLoadingFriends, isLoadingDms, isLoadingDmMessages, isLoadingMoreDmMessages, hasMoreDmMessages,
    onlineUserIds, typingUsers,
    // Actions
    fetchServers, fetchChannels, fetchMessages, sendMessage, deleteMessage,
    selectServer, selectChannel, toggleMobileSidebar,
    initWebSocket, destroyWebSocket, subscribeToChannel,
    getTypingUsers, sendTyping, stopTyping,
    fetchFriends, fetchDms, fetchDmMessages, sendDmMessage,
    sendFriendRequest, acceptFriendRequest, declineFriendRequest,
    selectDmPartner, selectHome
  }
})
