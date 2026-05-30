<script setup lang="ts">
const chatStore = useChatStore()

onMounted(() => {
  chatStore.fetchServers()
  chatStore.fetchFriends()
  chatStore.fetchDms()
  chatStore.initWebSocket()
})
</script>

<template>
  <div class="h-screen w-screen flex overflow-hidden bg-[#fafafa] dark:bg-[#0f0f11] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-primary-500/30">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary-500 focus:text-white"
    >
      Aller au contenu principal
    </a>

    <!-- Main App Container -->
    <div class="flex flex-1 w-full h-full">
      <!-- Mobile Sidebar Overlay & Container -->
      <div
        v-if="chatStore.isMobileSidebarOpen"
        class="fixed inset-0 bg-black/50 z-30 md:hidden"
        @click="chatStore.toggleMobileSidebar"
      />
      <div
        class="absolute md:relative z-40 md:z-auto h-full flex transition-transform duration-300"
        :class="chatStore.isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
      >
        <!-- Minimal Server Sidebar -->
        <ChatServerSidebar />

        <!-- Channel Sidebar -->
        <ChatChannelSidebar />
      </div>

      <!-- Main Content Area -->
      <main
        id="main-content"
        class="flex-1 flex flex-col min-w-0 bg-transparent relative"
        tabindex="-1"
      >
        <slot />
      </main>
    </div>

    <!-- Global Create Server Modal -->
    <ModalsCreateServerModal />

    <!-- Global Create Channel Modal -->
    <ModalsCreateChannelModal />

    <!-- Global GDPR / User Settings Modal -->
    <ModalsUserSettingsModal />

    <!-- Global Invite Modal -->
    <ModalsInviteModal />
  </div>
</template>
