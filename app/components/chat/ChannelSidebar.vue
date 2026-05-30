<script setup lang="ts">
const chatStore = useChatStore()
const { user, clear } = useUserSession()
const { createChannel, userSettings, invite } = useModals()

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
      <span class="truncate">{{ chatStore.activeServerId ? activeServerName : $t('sidebar.homeTab') }}</span>
      <UTooltip
        v-if="chatStore.activeServerId"
        :text="$t('invite.buttonTooltip')"
        placement="bottom"
      >
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-primary-500 transition-colors cursor-pointer"
          :aria-label="$t('invite.buttonTooltip')"
          @click="invite = true"
        >
          <UIcon
            name="i-lucide-user-plus"
            class="text-lg"
          />
        </button>
      </UTooltip>
    </div>

    <!-- Channel list / Friends list -->
    <div class="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
      <!-- CAS ACCUEIL (DMs & Amis) -->
      <template v-if="!chatStore.activeServerId">
        <!-- Bouton Amis -->
        <UButton
          icon="i-lucide-users"
          :color="chatStore.activeDmUserId === null ? 'primary' : 'neutral'"
          :variant="chatStore.activeDmUserId === null ? 'solid' : 'ghost'"
          class="w-full justify-start mb-4"
          @click="chatStore.selectHome"
        >
          <span>{{ $t('sidebar.friends') }}</span>
          <UBadge
            v-if="chatStore.friends.pendingIncoming.length > 0"
            color="primary"
            variant="solid"
            size="sm"
            class="ml-auto"
          >
            {{ chatStore.friends.pendingIncoming.length }}
          </UBadge>
        </UButton>

        <div class="flex items-center justify-between mb-2 px-3">
          <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            {{ $t('sidebar.dms') }}
          </span>
        </div>

        <!-- Liste des conversations privées -->
        <template v-if="chatStore.isLoadingDms">
          <div class="flex flex-col gap-3 px-3 mt-2">
            <div class="flex items-center gap-2">
              <USkeleton class="w-8 h-8 rounded-full shrink-0" />
              <div class="flex flex-col gap-1 w-full">
                <USkeleton class="h-3 w-[60%] rounded-md" />
                <USkeleton class="h-2 w-[40%] rounded-md" />
              </div>
            </div>
            <div class="flex items-center gap-2">
              <USkeleton class="w-8 h-8 rounded-full shrink-0" />
              <div class="flex flex-col gap-1 w-full">
                <USkeleton class="h-3 w-[50%] rounded-md" />
                <USkeleton class="h-2 w-[30%] rounded-md" />
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div
            v-if="chatStore.dmConversations.length === 0"
            class="px-3 py-4 text-xs text-zinc-400 text-center"
          >
            {{ $t('sidebar.noDms') }}
          </div>
          <UButton
            v-for="dm in chatStore.dmConversations"
            :key="dm.user.id"
            :color="chatStore.activeDmUserId === dm.user.id ? 'primary' : 'neutral'"
            :variant="chatStore.activeDmUserId === dm.user.id ? 'soft' : 'ghost'"
            class="w-full justify-start mb-1 text-left"
            @click="chatStore.selectDmPartner(dm.user.id)"
          >
            <UUser
              :name="dm.user.name"
              :description="dm.latestMessage"
              :avatar="{ src: dm.user.avatarUrl ?? undefined, alt: dm.user.name, text: dm.user.name.charAt(0).toUpperCase(), size: 'sm' }"
              class="min-w-0"
              :ui="{ description: 'truncate text-xs text-zinc-400 dark:text-zinc-500 leading-none mt-0.5', name: 'truncate text-sm font-semibold text-zinc-950 dark:text-white leading-tight' }"
            />
          </UButton>
        </template>
      </template>

      <!-- CAS SERVEUR (ORDINAIRE) -->
      <template v-else>
        <div class="flex items-center justify-between mb-2 px-3 mt-4">
          <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            {{ $t('sidebar.channels') }}
          </span>
          <button
            class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            :aria-label="$t('sidebar.createChannel')"
            @click="createChannel = true"
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
      </template>
    </div>

    <!-- User profile -->
    <div class="p-4 m-3 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-black/5 dark:border-white/5 flex items-center gap-3">
      <UUser
        :name="user?.name || $t('sidebar.defaultUser')"
        :description="$t('sidebar.online')"
        :avatar="{ src: user?.avatarUrl, text: (user?.name?.charAt(0).toUpperCase() || 'U') }"
        class="min-w-0 flex-1"
        :ui="{ description: 'text-xs text-primary-500 font-medium' }"
      />
      <button
        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 transition-colors cursor-pointer"
        :aria-label="$t('sidebar.settings')"
        @click="userSettings = true"
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
