<script setup lang="ts">
const chatStore = useChatStore()

const pendingRequests = computed(() => {
  return [
    ...chatStore.friends.pendingIncoming.map(r => ({ ...r, direction: 'incoming' })),
    ...chatStore.friends.pendingOutgoing.map(r => ({ ...r, direction: 'outgoing' }))
  ]
})
</script>

<template>
  <div>
    <div class="mb-4 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
      {{ $t('friends.pendingCount', { count: pendingRequests.length }) }}
    </div>
    <div
      v-if="pendingRequests.length === 0"
      class="flex flex-col items-center justify-center py-20 text-center text-zinc-400"
    >
      <UIcon
        name="i-lucide-send"
        class="text-6xl text-zinc-300 dark:text-zinc-700 mb-4"
      />
      <p>{{ $t('friends.noPending') }}</p>
    </div>
    <div
      v-else
      class="flex flex-col gap-2"
    >
      <div
        v-for="req in pendingRequests"
        :key="req.friendshipId"
        class="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 hover:border-zinc-200 dark:hover:border-zinc-800 transition-all"
      >
        <UUser
          :name="req.user.name"
          :description="req.direction === 'incoming' ? $t('friends.requestReceived') : $t('friends.requestSent')"
          :avatar="{ src: req.user.avatarUrl ?? undefined, alt: req.user.name, text: req.user.name.charAt(0).toUpperCase() }"
          class="min-w-0"
        />
        <div class="flex items-center gap-2">
          <template v-if="req.direction === 'incoming'">
            <UButton
              icon="i-lucide-check"
              color="primary"
              variant="solid"
              @click="chatStore.acceptFriendRequest(req.friendshipId)"
            >
              {{ $t('friends.acceptBtn') }}
            </UButton>
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              @click="chatStore.declineFriendRequest(req.friendshipId)"
            />
          </template>
          <template v-else>
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              @click="chatStore.declineFriendRequest(req.friendshipId)"
            >
              {{ $t('friends.cancelRequestBtn') }}
            </UButton>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
