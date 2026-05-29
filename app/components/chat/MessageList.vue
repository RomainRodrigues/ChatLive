<script setup lang="ts">
const chatStore = useChatStore()
const messagesContainer = ref<HTMLElement | null>(null)
const { scrollToBottom } = useChatScroll(messagesContainer)

const activeChannel = computed(() =>
  chatStore.channels.find(c => c.id === chatStore.activeChannelId)
)

watch(() => chatStore.messages.length, () => {
  scrollToBottom()
})

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div
    ref="messagesContainer"
    class="flex-1 overflow-y-auto p-8 flex flex-col scroll-smooth"
  >
    <!-- Loading State for Messages -->
    <div
      v-if="chatStore.isLoadingMessages"
      class="flex flex-col gap-6 mt-auto"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="flex gap-4 p-2"
      >
        <USkeleton class="w-12 h-12 rounded-2xl shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="flex items-center gap-2">
            <USkeleton class="h-4 w-28 rounded-md" />
            <USkeleton class="h-3 w-12 rounded-md" />
          </div>
          <USkeleton class="h-4 w-[85%] rounded-md" />
          <USkeleton class="h-4 w-[45%] rounded-md" />
        </div>
      </div>
    </div>

    <!-- Empty State for Channel -->
    <div
      v-else-if="chatStore.messages.length === 0 && activeChannel"
      class="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto my-auto"
    >
      <div class="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <UIcon
          name="i-lucide-messages-square"
          class="text-5xl text-primary-500"
        />
      </div>
      <h2 class="text-3xl font-bold mb-3 tracking-tight">
        {{ $t('chat.emptyTitle') }}
      </h2>
      <i18n-t
        keypath="chat.emptyDesc1"
        tag="p"
        class="text-zinc-500 dark:text-zinc-400 text-lg"
      >
        <template #name>
          <span class="font-semibold text-zinc-800 dark:text-zinc-200">#{{ activeChannel.name }}</span>
        </template>
      </i18n-t>
    </div>

    <!-- Messages Container -->
    <div
      v-else
      class="flex flex-col gap-4 mt-auto"
    >
      <ChatMessageItem
        v-for="msg in chatStore.messages"
        :key="msg.id"
        v-memo="[msg.id, msg.content, msg.createdAt]"
        :message="msg"
        @delete="chatStore.deleteMessage"
      />
    </div>
  </div>
</template>
