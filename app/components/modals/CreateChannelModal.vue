<script setup lang="ts">
import type { Channel } from '~/types/chat'

const isAddChannelOpen = useState<boolean>('isAddChannelOpen', () => false)
const newChannelName = ref('')
const isCreating = ref(false)
const chatStore = useChatStore()

async function createChannel() {
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
    isAddChannelOpen.value = false
    await chatStore.fetchChannels()
    if (channel?.id) {
      await chatStore.selectChannel(channel.id)
    }
  } catch (e) {
    console.error(e)
  } finally {
    isCreating.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="isAddChannelOpen"
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
        @keyup.enter="createChannel"
      />
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          variant="ghost"
          color="neutral"
          @click="isAddChannelOpen = false"
        >
          {{ $t('modal.cancel') }}
        </UButton>
        <UButton
          color="primary"
          :loading="isCreating"
          @click="createChannel"
        >
          {{ $t('modal.create') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
