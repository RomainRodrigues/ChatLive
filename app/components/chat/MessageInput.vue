<script setup lang="ts">
const chatStore = useChatStore()
const newMessage = ref('')

defineProps<{
  channelName: string
}>()

function onInput() {
  if (chatStore.activeChannelId) {
    chatStore.sendTyping(chatStore.activeChannelId)
  }
}

async function send() {
  if (!newMessage.value.trim()) return
  if (chatStore.activeChannelId) {
    chatStore.stopTyping(chatStore.activeChannelId)
  }
  await chatStore.sendMessage(newMessage.value.trim())
  newMessage.value = ''
}

const typingNames = computed(() =>
  chatStore.activeChannelId ? chatStore.getTypingUsers(chatStore.activeChannelId) : []
)
</script>

<template>
  <div class="shrink-0">
    <ChatTypingIndicator :names="typingNames" />
    <form
      class="px-6 pb-6 pt-0"
      @submit.prevent="send"
    >
      <UInput
        v-model="newMessage"
        :placeholder="$t('chat.placeholder', { name: channelName })"
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
</template>
