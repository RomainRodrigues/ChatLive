<script setup lang="ts">
const chatStore = useChatStore()
const currentTab = ref<'online' | 'all' | 'pending' | 'add'>('online')
</script>

<template>
  <div class="h-full flex flex-col bg-transparent">
    <!-- Header / Top Bar -->
    <header class="h-16 flex items-center justify-between px-6 border-b border-black/5 dark:border-white/5 shrink-0 select-none bg-white/35 dark:bg-[#0f0f11]/30 backdrop-blur-md z-10">
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
          <UIcon
            name="i-lucide-users"
            class="text-xl text-zinc-400"
          />
          <span>{{ $t('friends.title') }}</span>
        </div>
        <div class="h-6 w-[1px] bg-black/10 dark:bg-white/10" />

        <!-- Navigation Tabs -->
        <nav class="flex items-center gap-2">
          <UButton
            :color="currentTab === 'online' ? 'primary' : 'neutral'"
            :variant="currentTab === 'online' ? 'soft' : 'ghost'"
            @click="currentTab = 'online'"
          >
            {{ $t('friends.tabOnline') }}
          </UButton>
          <UButton
            :color="currentTab === 'all' ? 'primary' : 'neutral'"
            :variant="currentTab === 'all' ? 'soft' : 'ghost'"
            @click="currentTab = 'all'"
          >
            {{ $t('friends.tabAll') }}
          </UButton>
          <UButton
            :color="currentTab === 'pending' ? 'primary' : 'neutral'"
            :variant="currentTab === 'pending' ? 'soft' : 'ghost'"
            @click="currentTab = 'pending'"
          >
            {{ $t('friends.tabPending') }}
            <UBadge
              v-if="chatStore.friends.pendingIncoming.length > 0"
              color="primary"
              variant="solid"
              size="sm"
              class="ml-1"
              :ui="{ rounded: 'rounded-full' }"
            >
              {{ chatStore.friends.pendingIncoming.length }}
            </UBadge>
          </UButton>
          <UButton
            :color="currentTab === 'add' ? 'primary' : 'neutral'"
            :variant="currentTab === 'add' ? 'solid' : 'outline'"
            @click="currentTab = 'add'"
          >
            {{ $t('friends.tabAdd') }}
          </UButton>
        </nav>
      </div>
    </header>

    <!-- Main Content Panel -->
    <div class="flex-1 overflow-y-auto p-8 max-w-4xl w-full mx-auto">
      <LazyChatFriendsList
        v-if="currentTab === 'online'"
        type="online"
      />
      <LazyChatFriendsList
        v-else-if="currentTab === 'all'"
        type="all"
      />
      <LazyChatFriendsPending v-else-if="currentTab === 'pending'" />
      <LazyChatFriendsAdd v-else-if="currentTab === 'add'" />
    </div>
  </div>
</template>
