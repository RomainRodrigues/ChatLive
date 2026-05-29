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
  <div class="group relative flex items-start gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 rounded-2xl transition-all border border-transparent hover:border-black/5 dark:hover:border-white/5">
    <!-- User Avatar -->
    <UAvatar
      :src="message.user.avatarUrl ?? undefined"
      :alt="message.user.name"
      :text="message.user.name.charAt(0).toUpperCase()"
      size="md"
      class="shrink-0"
    />

    <!-- Message Content Container -->
    <div class="flex-1 min-w-0">
      <div class="flex items-baseline gap-2 mb-1">
        <span class="font-bold text-sm text-zinc-900 dark:text-white truncate">
          {{ message.user.name }}
        </span>
        <span class="text-xs text-zinc-400 dark:text-zinc-500 font-medium shrink-0">
          {{ formattedTime }}
        </span>
      </div>
      <div class="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words">
        {{ message.content }}
      </div>
    </div>

    <!-- Floating Actions Panel -->
    <div
      v-if="message.user.id === user?.id"
      class="absolute right-4 top-3.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5"
    >
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-trash-2"
        size="sm"
        :aria-label="$t('chat.deleteMessage')"
        @click="emit('delete', message.id)"
      />
    </div>
  </div>
</template>
