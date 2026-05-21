<script setup lang="ts">
const isAddServerOpen = useState<boolean>('isAddServerOpen', () => false)
const newServerName = ref('')
const isCreating = ref(false)
const chatStore = useChatStore()

async function createServer() {
  if (!newServerName.value.trim()) return
  isCreating.value = true
  try {
    await $fetch('/api/servers', {
      method: 'POST',
      body: { name: newServerName.value.trim() }
    })
    newServerName.value = ''
    isAddServerOpen.value = false
    await chatStore.fetchServers()
  } catch (e) {
    console.error(e)
  } finally {
    isCreating.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="isAddServerOpen"
    :close="false"
    title="Créer un nouvel espace"
  >
    <template #body>
      <p class="text-sm text-zinc-500 mb-6">
        Donnez un nom à votre serveur pour commencer à discuter avec votre communauté.
      </p>
      <input
        v-model="newServerName"
        type="text"
        placeholder="Nom du serveur"
        autofocus
        class="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
        @keyup.enter="createServer"
      >
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          variant="ghost"
          color="neutral"
          @click="isAddServerOpen = false"
        >
          Annuler
        </UButton>
        <UButton
          color="primary"
          :loading="isCreating"
          @click="createServer"
        >
          Créer
        </UButton>
      </div>
    </template>
  </UModal>
</template>
