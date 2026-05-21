<script setup lang="ts">
import type { Message } from '~/types/chat'

const props = defineProps<{
  message: Message
}>()

const { user } = useUserSession()

const emit = defineEmits<{
  (e: 'delete', id: string): void
}>()

const formattedTime = computed(() => {
  try {
    const date = new Date(props.message.createdAt)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
})
</script>

<template>
  <div class="flex gap-4 group hover:bg-black/2 dark:hover:bg-white/2 p-2 rounded-xl transition-all relative">
    <!-- User Avatar -->
    <img
      v-if="message.user.avatarUrl"
      :src="message.user.avatarUrl"
      :alt="message.user.name"
      class="w-12 h-12 rounded-2xl shadow-sm object-cover shrink-0"
    >
    <div
      v-else
      class="w-12 h-12 rounded-2xl shadow-sm bg-primary-100 dark:bg-primary-950 text-primary-500 flex items-center justify-center font-bold text-lg shrink-0"
    >
      {{ message.user.name.charAt(0).toUpperCase() }}
    </div>

    <!-- Message Content Details -->
    <div class="flex-1 min-w-0">
      <div class="flex items-baseline gap-3 mb-1">
        <span class="font-bold text-[15px] truncate">{{ message.user.name }}</span>
        <span class="text-xs text-zinc-400 font-medium shrink-0">{{ formattedTime }}</span>
      </div>
      <div class="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words">
        {{ message.content }}
      </div>
    </div>

    <!-- Delete Action Button (floating right on hover) -->
    <div
      v-if="message.user.id === user?.id"
      class="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-2 flex bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700 rounded-lg shadow-sm p-1 z-10"
    >
      <button
        class="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-950/50 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
        aria-label="Supprimer le message"
        @click="emit('delete', message.id)"
      >
        <UIcon
          name="i-lucide-trash-2"
          class="text-sm"
        />
      </button>
    </div>
  </div>
</template>
