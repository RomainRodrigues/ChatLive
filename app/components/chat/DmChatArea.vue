<script setup lang="ts">
const chatStore = useChatStore()
const { t } = useI18n()
const { user } = useUserSession()
const newMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const { scrollToBottom } = useChatScroll(messagesContainer)

const partner = computed(() => {
  if (!chatStore.activeDmUserId) return null
  const convo = chatStore.dmConversations.find(c => c.user.id === chatStore.activeDmUserId)
  if (convo) return convo.user
  const fr = chatStore.friends.friends.find(f => f.user.id === chatStore.activeDmUserId)
  if (fr) return fr.user
  return { id: chatStore.activeDmUserId, name: t('chat.friendDefault'), avatarUrl: null }
})

const dmRoomId = computed(() => {
  if (!user.value?.id || !chatStore.activeDmUserId) return null
  return `dm:${[user.value.id, chatStore.activeDmUserId].sort().join('_')}`
})

const typingNames = computed(() =>
  dmRoomId.value ? chatStore.getTypingUsers(dmRoomId.value) : []
)

let isLoadingOlder = false

const handleScroll = async () => {
  if (!messagesContainer.value || chatStore.isLoadingMoreDmMessages || !chatStore.hasMoreDmMessages) return

  if (messagesContainer.value.scrollTop === 0) {
    const oldScrollHeight = messagesContainer.value.scrollHeight
    isLoadingOlder = true
    await chatStore.fetchDmMessages(false, true)

    await nextTick()
    if (messagesContainer.value) {
      const newScrollHeight = messagesContainer.value.scrollHeight
      messagesContainer.value.scrollTop = newScrollHeight - oldScrollHeight
    }
    isLoadingOlder = false
  }
}

watch(() => chatStore.dmMessages.length, () => {
  if (!isLoadingOlder) {
    scrollToBottom()
  }
})

onMounted(() => {
  scrollToBottom()
})

async function handleSend() {
  const content = newMessage.value.trim()
  if (!content) return
  if (dmRoomId.value) chatStore.stopTyping(dmRoomId.value)
  await chatStore.sendDmMessage(content)
  newMessage.value = ''
  scrollToBottom()
}

function onInput() {
  if (dmRoomId.value) chatStore.sendTyping(dmRoomId.value)
}

function formatTime(createdAt: string | Date) {
  try {
    const date = new Date(createdAt)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}
</script>

<template>
  <div
    v-if="partner"
    class="h-full flex flex-col bg-transparent"
  >
    <!-- Header -->
    <header class="h-16 flex items-center justify-between px-6 border-b border-black/5 dark:border-white/5 shrink-0 select-none bg-white/35 dark:bg-[#0f0f11]/30 backdrop-blur-md z-10">
      <div class="flex items-center gap-3">
        <!-- Mobile Sidebar Toggle -->
        <UButton
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          class="md:hidden -ml-2 mr-1"
          @click="chatStore.toggleMobileSidebar"
        />
        <UUser
          :name="partner.name"
          :description="chatStore.onlineUserIds.has(partner.id) ? $t('chat.statusOnline') : $t('chat.statusOffline')"
          :avatar="{ src: partner.avatarUrl ?? undefined, alt: partner.name, text: partner.name.charAt(0).toUpperCase(), size: 'sm' }"
          class="min-w-0"
        >
          <template #avatar>
            <div class="relative">
              <UAvatar
                :src="partner.avatarUrl ?? undefined"
                :alt="partner.name"
                :text="partner.name.charAt(0).toUpperCase()"
                size="sm"
              />
              <div
                v-if="chatStore.onlineUserIds.has(partner.id)"
                class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"
              />
              <div
                v-else
                class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-zinc-400 dark:bg-zinc-600 border-2 border-white dark:border-zinc-900 rounded-full"
              />
            </div>
          </template>
        </UUser>
      </div>
    </header>

    <!-- Message Area -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-8 flex flex-col scroll-smooth"
      @scroll="handleScroll"
    >
      <!-- Loading -->
      <div
        v-if="chatStore.isLoadingDmMessages"
        class="flex flex-col gap-6 mt-auto"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="flex gap-4 p-2"
        >
          <USkeleton class="w-10 h-10 rounded-full shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="flex items-center gap-2">
              <USkeleton class="h-4 w-28 rounded-md" />
              <USkeleton class="h-3 w-12 rounded-md" />
            </div>
            <USkeleton class="h-4 w-[85%] rounded-md" />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="chatStore.dmMessages.length === 0"
        class="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto my-auto"
      >
        <div class="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-6">
          <UIcon
            name="i-lucide-message-circle"
            class="text-4xl text-primary-500"
          />
        </div>
        <h2 class="text-2xl font-bold mb-2 tracking-tight">
          {{ $t('chat.dmWelcomeTitle') }}
        </h2>
        <i18n-t
          keypath="chat.dmWelcomeDesc"
          tag="p"
          class="text-zinc-500 dark:text-zinc-400 text-sm"
        >
          <template #name>
            <span class="font-semibold text-zinc-800 dark:text-zinc-200">{{ partner.name }}</span>
          </template>
        </i18n-t>
      </div>

      <!-- Messages list -->
      <div
        v-else
        class="flex flex-col gap-4 mt-auto"
      >
        <!-- Loading Older State -->
        <div
          v-if="chatStore.isLoadingMoreDmMessages"
          class="flex justify-center py-4"
        >
          <UIcon
            name="i-lucide-loader-2"
            class="animate-spin text-2xl text-primary-500"
          />
        </div>

        <div
          v-for="msg in chatStore.dmMessages"
          :key="msg.id"
          v-memo="[msg.id, msg.content, msg.createdAt]"
          class="group relative flex items-start gap-4 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 rounded-2xl transition-all border border-transparent hover:border-black/5 dark:hover:border-white/5"
        >
          <UAvatar
            :src="msg.user.avatarUrl ?? undefined"
            :alt="msg.user.name"
            :text="msg.user.name.charAt(0).toUpperCase()"
            size="md"
            class="shrink-0"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-baseline gap-2 mb-0.5">
              <span class="font-bold text-sm text-zinc-900 dark:text-white truncate">
                {{ msg.user.name }}
              </span>
              <span class="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium shrink-0">
                {{ formatTime(msg.createdAt) }}
              </span>
            </div>
            <div class="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words">
              {{ msg.content }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Input Form -->
    <div class="shrink-0">
      <ChatTypingIndicator :names="typingNames" />
      <form
        class="px-6 pb-6 pt-0"
        @submit.prevent="handleSend"
      >
        <UInput
          v-model="newMessage"
          :placeholder="$t('chat.dmPlaceholder', { name: partner.name })"
          maxlength="4000"
          size="lg"
          class="w-full"
          :ui="{ base: 'py-3' }"
          @input="onInput"
        >
          <template #trailing>
            <UButton
              :disabled="!newMessage.trim()"
              icon="i-lucide-send"
              size="sm"
              variant="ghost"
              type="submit"
              class="cursor-pointer"
            />
          </template>
        </UInput>
      </form>
    </div>
  </div>
</template>
