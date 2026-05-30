<script setup lang="ts">
const { invite: isOpen } = useModals()
const chatStore = useChatStore()
const toast = useToast()
const { t } = useI18n()

const activeServer = computed(() => {
  return chatStore.servers.find(s => s.id === chatStore.activeServerId)
})

const inviteUrl = computed(() => {
  if (!import.meta.client || !activeServer.value?.inviteCode) return ''
  return `${window.location.origin}/invite/${activeServer.value.inviteCode}`
})

const isCopied = ref(false)

async function copyLink() {
  if (!inviteUrl.value) return
  try {
    await navigator.clipboard.writeText(inviteUrl.value)
    isCopied.value = true
    toast.add({
      title: t('invite.toastSuccess'),
      description: t('invite.toastSuccessDesc'),
      color: 'success'
    })
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (e) {
    handleApiError(e, 'Impossible de copier le lien.')
  }
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :close="true"
    :title="t('invite.modalTitle', { server: activeServer?.name || '' })"
  >
    <template #body>
      <p class="text-sm text-zinc-500 mb-6">
        {{ t('invite.modalDesc') }}
      </p>

      <div class="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1.5 border border-black/5 dark:border-white/5">
        <input
          :value="inviteUrl"
          readonly
          class="flex-1 bg-transparent px-3 py-2 outline-none text-zinc-800 dark:text-zinc-200 text-sm select-all truncate"
          @click="($event.target as HTMLInputElement).select()"
        >
        <UButton
          :color="isCopied ? 'success' : 'primary'"
          size="sm"
          class="shrink-0"
          :icon="isCopied ? 'i-lucide-check' : 'i-lucide-copy'"
          @click="copyLink"
        >
          {{ isCopied ? t('invite.copiedBtn') : t('invite.copyBtn') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
