<script setup lang="ts">
const chatStore = useChatStore()

onMounted(() => {
  chatStore.fetchServers()
  chatStore.initWebSocket()
})
</script>

<template>
  <div class="h-screen w-screen flex overflow-hidden bg-[#fafafa] dark:bg-[#0f0f11] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-primary-500/30">
    <!-- Main App Container -->
    <div class="flex flex-1 w-full h-full">
      <!-- Minimal Server Sidebar -->
      <ChatServerSidebar />

      <!-- Channel Sidebar -->
      <ChatChannelSidebar />

      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col min-w-0 bg-transparent relative">
        <slot />
      </main>
    </div>

    <!-- Global Create Server Modal -->
    <ModalsCreateServerModal />

    <!-- Global Create Channel Modal -->
    <ModalsCreateChannelModal />
  </div>
</template>
