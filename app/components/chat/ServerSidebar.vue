<script setup lang="ts">
const chatStore = useChatStore()
const isAddServerOpen = useState<boolean>('isAddServerOpen', () => false)
</script>

<template>
  <aside class="w-[80px] bg-white/50 dark:bg-black/20 backdrop-blur-md flex flex-col items-center py-6 gap-4 border-r border-black/5 dark:border-white/5 shrink-0 z-20">
    <UTooltip
      text="Accueil"
      placement="right"
    >
      <UButton
        to="/"
        icon="i-lucide-message-square"
        color="primary"
        variant="ghost"
        class="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 hover:bg-primary-50 dark:hover:bg-primary-950"
      />
    </UTooltip>

    <div class="w-8 h-[1px] bg-black/10 dark:bg-white/10 my-2" />

    <!-- Loading Skeletons for servers -->
    <template v-if="chatStore.isLoadingServers">
      <USkeleton class="w-12 h-12 rounded-2xl" />
      <USkeleton class="w-12 h-12 rounded-2xl" />
      <USkeleton class="w-12 h-12 rounded-2xl" />
    </template>

    <template v-else>
      <UTooltip
        v-for="server in chatStore.servers"
        :key="server.id"
        :text="server.name"
        placement="right"
      >
        <button
          :class="[
            'w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-medium transition-all duration-300 relative group cursor-pointer',
            chatStore.activeServerId === server.id
              ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
              : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
          ]"
          @click="chatStore.selectServer(server.id)"
        >
          {{ server.name.charAt(0).toUpperCase() }}
          <!-- Active indicator -->
          <div
            v-if="chatStore.activeServerId !== server.id"
            class="absolute -left-3 w-1 h-0 bg-primary-500 rounded-r-full transition-all duration-300 group-hover:h-5 group-hover:left-0"
          />
        </button>
      </UTooltip>
    </template>

    <UTooltip
      text="Nouveau serveur"
      placement="right"
    >
      <button
        class="w-12 h-12 rounded-2xl flex items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 hover:text-primary-500 hover:border-primary-500 transition-colors cursor-pointer"
        @click="isAddServerOpen = true"
      >
        <UIcon
          name="i-lucide-plus"
          class="text-xl"
        />
      </button>
    </UTooltip>
  </aside>
</template>
