<script setup lang="ts">
import type { Channel } from '~/types/chat'

defineProps<{
  channel: Channel
}>()

const colorMode = useColorMode()
const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})

function toggleColorMode() {
  isDark.value = !isDark.value
}
</script>

<template>
  <div class="h-16 flex items-center px-8 shrink-0 bg-white/50 dark:bg-black/20 backdrop-blur-md border-b border-black/5 dark:border-white/5 z-10">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-500 flex items-center justify-center">
        <UIcon
          name="i-lucide-hash"
          class="text-xl"
        />
      </div>
      <div>
        <h2 class="font-bold text-lg leading-tight">
          {{ channel.name }}
        </h2>
        <p class="text-xs text-zinc-500">
          Salon de discussion général
        </p>
      </div>
    </div>

    <div class="flex-1" />

    <div class="flex items-center gap-2">
      <button
        class="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
        :aria-label="isDark ? 'Activer le mode clair' : 'Activer le mode sombre'"
        @click="toggleColorMode"
      >
        <UIcon
          :name="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
          class="text-lg"
        />
      </button>
    </div>
  </div>
</template>
