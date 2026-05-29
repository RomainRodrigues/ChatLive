<script setup lang="ts">
const chatStore = useChatStore()

const activeChannel = computed(() =>
  chatStore.channels.find(c => c.id === chatStore.activeChannelId)
)
</script>

<template>
  <div class="h-full flex flex-col min-w-0">
    <!-- 1. MODE ACCUEIL (Sans serveur actif) -->
    <template v-if="!chatStore.activeServerId">
      <!-- Onglet Amis actif -->
      <LazyChatFriendsDashboard v-if="!chatStore.activeDmUserId" />

      <!-- Chat privé avec un ami -->
      <LazyChatDmChatArea v-else />
    </template>

    <!-- 2. MODE SERVEUR (Avec serveur actif) -->
    <template v-else>
      <div
        v-if="activeChannel"
        class="h-full flex flex-col"
      >
        <!-- Top bar -->
        <LazyChatHeader :channel="activeChannel" />

        <!-- Chat messages area -->
        <LazyChatMessageList />

        <!-- Floating Input area -->
        <LazyChatMessageInput :channel-name="activeChannel.name" />
      </div>

      <!-- Welcome Empty State -->
      <LazyChatWelcomeState v-else />
    </template>
  </div>
</template>
