<script setup lang="ts">
const chatStore = useChatStore()
const { user, clear } = useUserSession()
const isAddChannelOpen = useState<boolean>('isAddChannelOpen', () => false)
const isUserSettingsOpen = useState<boolean>('isUserSettingsOpen', () => false)
const isInviteOpen = useState<boolean>('isInviteOpen', () => false)

async function handleLogout() {
  await clear()
  window.location.href = '/login'
}

const activeServerName = computed(() => {
  return chatStore.servers.find(s => s.id === chatStore.activeServerId)?.name || 'ChatLive'
})
</script>

<template>
  <aside class="w-64 bg-zinc-50/80 dark:bg-zinc-900/40 backdrop-blur-sm flex flex-col border-r border-black/5 dark:border-white/5 shrink-0 z-10">
    <!-- Server Name Title -->
    <div class="h-16 flex items-center justify-between px-6 font-semibold text-lg tracking-tight border-b border-black/5 dark:border-white/5">
      <span class="truncate">{{ activeServerName }}</span>
      <UTooltip
        v-if="chatStore.activeServerId"
        :text="$t('invite.buttonTooltip')"
        placement="bottom"
      >
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-primary-500 transition-colors cursor-pointer"
          :aria-label="$t('invite.buttonTooltip')"
          @click="isInviteOpen = true"
        >
          <UIcon
            name="i-lucide-user-plus"
            class="text-lg"
          />
        </button>
      </UTooltip>
    </div>

    <!-- Channel list -->
    <div class="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
      <div class="flex items-center justify-between mb-2 px-3 mt-4">
        <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          {{ $t('sidebar.channels') }}
        </span>
        <button
          v-if="chatStore.activeServerId"
          class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          :aria-label="$t('sidebar.createChannel')"
          @click="isAddChannelOpen = true"
        >
          <UIcon
            name="i-lucide-plus"
            class="text-sm font-bold"
          />
        </button>
      </div>

      <!-- Loading Skeletons for channels -->
      <template v-if="chatStore.isLoadingChannels">
        <div class="flex flex-col gap-3 px-3 mt-2">
          <div class="flex items-center gap-2">
            <USkeleton class="w-4 h-4 rounded-md" />
            <USkeleton class="h-4 w-[80%] rounded-md" />
          </div>
          <div class="flex items-center gap-2">
            <USkeleton class="w-4 h-4 rounded-md" />
            <USkeleton class="h-4 w-[60%] rounded-md" />
          </div>
          <div class="flex items-center gap-2">
            <USkeleton class="w-4 h-4 rounded-md" />
            <USkeleton class="h-4 w-[75%] rounded-md" />
          </div>
          <div class="flex items-center gap-2">
            <USkeleton class="w-4 h-4 rounded-md" />
            <USkeleton class="h-4 w-[50%] rounded-md" />
          </div>
        </div>
      </template>

      <template v-else>
        <button
          v-for="channel in chatStore.channels"
          :key="channel.id"
          :class="[
            'w-full flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group cursor-pointer',
            chatStore.activeChannelId === channel.id
              ? 'bg-white dark:bg-zinc-800 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'
          ]"
          @click="chatStore.selectChannel(channel.id)"
        >
          <UIcon
            name="i-lucide-hash"
            class="mr-3 opacity-50 text-lg group-hover:opacity-100"
          />
          {{ channel.name }}
        </button>
      </template>
    </div>

    <!-- User profile -->
    <div class="p-4 m-3 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-black/5 dark:border-white/5 flex items-center gap-3">
      <img
        v-if="user?.avatarUrl"
        :src="user.avatarUrl"
        :alt="user.name"
        class="w-10 h-10 rounded-full"
      >
      <div
        v-else
        class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-500 flex items-center justify-center font-bold"
      >
        {{ user?.name?.charAt(0).toUpperCase() || 'U' }}
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-semibold truncate">
          {{ user?.name || 'Utilisateur' }}
        </div>
        <div class="text-xs text-primary-500 font-medium">
          {{ $t('sidebar.online') }}
        </div>
      </div>
      <button
        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 transition-colors cursor-pointer"
        :aria-label="$t('sidebar.settings')"
        @click="isUserSettingsOpen = true"
      >
        <UIcon name="i-lucide-settings" />
      </button>
      <button
        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 transition-colors cursor-pointer"
        :aria-label="$t('sidebar.logout')"
        @click="handleLogout"
      >
        <UIcon name="i-lucide-log-out" />
      </button>
    </div>
  </aside>
</template>
