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
  <form
    class="p-6 pt-0 shrink-0"
    @submit.prevent="send"
  >
    <UInput
      v-model="newMessage"
      :placeholder="$t('chat.placeholder', { name: channelName })"
      maxlength="4000"
      size="lg"
      class="w-full"
      :ui="{ base: 'py-3' }"
    >
      <template #trailing>
        <UButton
          :disabled="!newMessage.trim()"
          icon="i-lucide-send"
          size="sm"
          variant="ghost"
          type="submit"
          class="cursor-pointer"
        />
      </template>
    </UInput>
  </form>
</template>
