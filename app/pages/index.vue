<script setup lang="ts">
const chatStore = useChatStore()

const activeChannel = computed(() =>
  chatStore.channels.find(c => c.id === chatStore.activeChannelId)
)
</script>

<template>
  <div
    v-if="activeChannel"
    class="h-full flex flex-col"
  >
    <!-- Top bar -->
    <ChatHeader :channel="activeChannel" />

    <!-- Chat messages area -->
    <ChatMessageList />

    <!-- Floating Input area -->
    <ChatMessageInput :channel-name="activeChannel.name" />
  </div>

  <!-- Welcome Empty State -->
  <ChatWelcomeState v-else />
</template>
