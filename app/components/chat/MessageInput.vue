<script setup lang="ts">
const chatStore = useChatStore()
const newMessage = ref('')

defineProps<{
  channelName: string
}>()

async function send() {
  if (!newMessage.value.trim()) return
  await chatStore.sendMessage(newMessage.value.trim())
  newMessage.value = ''
}
</script>

<template>
  <div class="p-6 pt-0 shrink-0">
    <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20 border border-zinc-100 dark:border-zinc-700 flex items-end p-2 transition-all focus-within:ring-2 focus-within:ring-primary-500/50">
      <!-- Input Text Area -->
      <textarea
        v-model="newMessage"
        rows="1"
        :placeholder="$t('chat.placeholder', { name: channelName })"
        class="flex-1 max-h-32 min-h-[48px] bg-transparent border-none focus:ring-0 outline-none pl-4 pr-2 py-3 text-[15px] resize-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
        @keydown.enter.prevent="send"
      />

      <!-- Action Send Button -->
      <div class="flex gap-1 shrink-0 px-2 py-1">
        <button
          :disabled="!newMessage.trim()"
          class="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-500 text-white shadow-md disabled:opacity-50 transition-all hover:bg-primary-600 cursor-pointer disabled:cursor-not-allowed"
          :aria-label="$t('chat.send')"
          @click="send"
        >
          <UIcon
            name="i-lucide-send"
            class="text-lg"
          />
        </button>
      </div>
    </div>
  </div>
</template>
