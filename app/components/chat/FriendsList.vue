<script setup lang="ts">
defineProps<{
  type: 'online' | 'all'
}>()

const chatStore = useChatStore()

const friends = computed(() => {
  // Le store renvoie la liste complète des amis acceptés
  return chatStore.friends.friends
})

const onlineFriends = computed(() => {
  return friends.value.filter(f => chatStore.onlineUserIds.has(f.user.id))
})
</script>

<template>
  <div>
    <!-- ONLINE TAB -->
    <template v-if="type === 'online'">
      <div class="mb-4 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
        {{ $t('friends.onlineCount', { count: onlineFriends.length }) }}
      </div>
      <div
        v-if="onlineFriends.length === 0"
        class="flex flex-col items-center justify-center py-20 text-center text-zinc-400"
      >
        <UIcon
          name="i-lucide-smile"
          class="text-6xl text-zinc-300 dark:text-zinc-700 mb-4"
        />
        <p>{{ $t('friends.noOnline') }}</p>
      </div>
      <div
        v-else
        class="flex flex-col gap-2"
      >
        <div
          v-for="friend in onlineFriends"
          :key="friend.friendshipId"
          class="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 hover:border-zinc-200 dark:hover:border-zinc-800 transition-all group"
        >
          <UUser
            :name="friend.user.name"
            :description="$t('friends.statusOnline')"
            :avatar="{ src: friend.user.avatarUrl ?? undefined, alt: friend.user.name, text: friend.user.name.charAt(0).toUpperCase() }"
            :ui="{ description: 'text-green-500 font-medium' }"
            class="min-w-0"
          >
            <template #avatar>
              <div class="relative">
                <UAvatar
                  :src="friend.user.avatarUrl ?? undefined"
                  :alt="friend.user.name"
                  :text="friend.user.name.charAt(0).toUpperCase()"
                  size="md"
                />
                <div
                  v-if="chatStore.onlineUserIds.has(friend.user.id)"
                  class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"
                />
                <div
                  v-else
                  class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-zinc-400 dark:bg-zinc-600 border-2 border-white dark:border-zinc-900 rounded-full"
                />
              </div>
            </template>
          </UUser>
          <div class="flex items-center gap-2">
            <UButton
              icon="i-lucide-message-square"
              color="neutral"
              variant="subtle"
              @click="chatStore.selectDmPartner(friend.user.id)"
            >
              {{ $t('friends.chatBtn') }}
            </UButton>
            <UButton
              icon="i-lucide-user-minus"
              color="error"
              variant="ghost"
              class="opacity-0 group-hover:opacity-100 transition-opacity"
              @click="chatStore.declineFriendRequest(friend.friendshipId)"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- ALL TAB -->
    <template v-else>
      <div class="mb-4 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
        {{ $t('friends.allCount', { count: friends.length }) }}
      </div>
      <div
        v-if="friends.length === 0"
        class="flex flex-col items-center justify-center py-20 text-center text-zinc-400"
      >
        <UIcon
          name="i-lucide-smile"
          class="text-6xl text-zinc-300 dark:text-zinc-700 mb-4"
        />
        <p>{{ $t('friends.noFriends') }}</p>
      </div>
      <div
        v-else
        class="flex flex-col gap-2"
      >
        <div
          v-for="friend in friends"
          :key="friend.friendshipId"
          class="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 hover:border-zinc-200 dark:hover:border-zinc-800 transition-all group"
        >
          <div class="flex items-center gap-3">
            <img
              v-if="friend.user.avatarUrl"
              :src="friend.user.avatarUrl"
              :alt="friend.user.name"
              class="w-10 h-10 rounded-full"
            >
            <div
              v-else
              class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-500 flex items-center justify-center font-bold text-lg"
            >
              {{ friend.user.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="font-semibold text-zinc-900 dark:text-zinc-100">
                {{ friend.user.name }}
              </div>
              <div class="text-xs text-zinc-400">
                {{ friend.user.email }}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <UButton
              icon="i-lucide-message-square"
              color="neutral"
              variant="subtle"
              @click="chatStore.selectDmPartner(friend.user.id)"
            >
              {{ $t('friends.chatBtn') }}
            </UButton>
            <UButton
              icon="i-lucide-user-minus"
              color="error"
              variant="ghost"
              class="opacity-0 group-hover:opacity-100 transition-opacity"
              @click="chatStore.declineFriendRequest(friend.friendshipId)"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
