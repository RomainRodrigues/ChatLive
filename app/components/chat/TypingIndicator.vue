<script setup lang="ts">
defineProps<{
  names: string[]
}>()
</script>

<template>
  <Transition name="typing-fade">
    <div
      v-if="names.length > 0"
      class="flex items-center gap-2 px-4 pb-1 h-6 text-xs text-zinc-500 dark:text-zinc-400 select-none"
    >
      <!-- Animated dots -->
      <span class="flex items-center gap-0.5">
        <span
          class="typing-dot"
          style="animation-delay: 0ms"
        />
        <span
          class="typing-dot"
          style="animation-delay: 150ms"
        />
        <span
          class="typing-dot"
          style="animation-delay: 300ms"
        />
      </span>
      <!-- Names -->
      <span class="font-medium">
        <template v-if="names.length === 1">
          <span class="text-zinc-700 dark:text-zinc-300">{{ names[0] }}</span>
          {{ $t('chat.typingSingle') }}
        </template>
        <template v-else-if="names.length === 2">
          <span class="text-zinc-700 dark:text-zinc-300">{{ names[0] }}</span>
          {{ $t('chat.typingAnd') }}
          <span class="text-zinc-700 dark:text-zinc-300">{{ names[1] }}</span>
          {{ $t('chat.typingMultiple') }}
        </template>
        <template v-else>
          <span class="text-zinc-700 dark:text-zinc-300">{{ names.slice(0, -1).join(', ') }}</span>
          {{ $t('chat.typingAnd') }}
          <span class="text-zinc-700 dark:text-zinc-300">{{ names[names.length - 1] }}</span>
          {{ $t('chat.typingMultiple') }}
        </template>
      </span>
    </div>
  </Transition>
</template>

<style scoped>
.typing-dot {
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: currentColor;
  animation: typing-bounce 1.2s ease-in-out infinite;
}

@keyframes typing-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

/* Fade in/out transition */
.typing-fade-enter-active,
.typing-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.typing-fade-enter-from,
.typing-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
