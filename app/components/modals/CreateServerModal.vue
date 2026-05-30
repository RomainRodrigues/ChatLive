<script setup lang="ts">
const { createServer: isOpen } = useModals()
const newServerName = ref('')
const isCreating = ref(false)
const chatStore = useChatStore()

async function handleCreate() {
  if (!newServerName.value.trim()) return
  isCreating.value = true
  try {
    await $fetch('/api/servers', {
      method: 'POST',
      body: { name: newServerName.value.trim() }
    })
    newServerName.value = ''
    isOpen.value = false
    await chatStore.fetchServers()
  } catch (e) {
    handleApiError(e, 'Impossible de créer le serveur.')
  } finally {
    isCreating.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :close="false"
    :title="$t('modal.createServerTitle')"
  >
    <template #body>
      <p class="text-sm text-zinc-500 mb-6">
        {{ $t('modal.createServerDesc') }}
      </p>
      <UInput
        v-model="newServerName"
        type="text"
        :placeholder="$t('modal.serverPlaceholder')"
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
