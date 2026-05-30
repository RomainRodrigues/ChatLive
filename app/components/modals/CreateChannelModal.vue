<script setup lang="ts">
import type { Channel } from '~/types/chat'

const { createChannel: isOpen } = useModals()
const newChannelName = ref('')
const isCreating = ref(false)
const chatStore = useChatStore()

async function handleCreate() {
  if (!newChannelName.value.trim() || !chatStore.activeServerId) return
  isCreating.value = true
  try {
    const channel = await $fetch<Channel>('/api/channels', {
      method: 'POST',
      body: {
        name: newChannelName.value.trim(),
        serverId: chatStore.activeServerId
      }
    })
    newChannelName.value = ''
    isOpen.value = false
    await chatStore.fetchChannels()
    if (channel?.id) {
      await chatStore.selectChannel(channel.id)
    }
  } catch (e) {
    handleApiError(e, 'Impossible de créer le salon.')
  } finally {
    isCreating.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :close="false"
    :title="$t('modal.createChannelTitle')"
  >
    <template #body>
      <p class="text-sm text-zinc-500 mb-6">
        {{ $t('modal.createChannelDesc') }}
      </p>
      <UInput
        v-model="newChannelName"
        type="text"
        :placeholder="$t('modal.channelPlaceholder')"
        autofocus
        maxlength="100"
        class="w-full"
        @keyup.enter="handleCreate"
      />
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          variant="ghost"
          color="neutral"
          @click="isOpen = false"
        >
          {{ $t('modal.cancel') }}
        </UButton>
        <UButton
          color="primary"
          :loading="isCreating"
          @click="handleCreate"
        >
          {{ $t('modal.create') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
