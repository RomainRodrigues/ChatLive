<script setup lang="ts">
const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t } = useI18n()
const { clear } = useUserSession()

const isExporting = ref(false)
const isDeleting = ref(false)
const showDeleteConfirm = ref(false)
const deleteConfirmationText = ref('')
const toast = useToast()

const deleteWord = computed(() => t('settings.deleteWord'))

// Réinitialiser les états lors du montage du composant
onMounted(() => {
  showDeleteConfirm.value = false
  deleteConfirmationText.value = ''
})

async function exportData() {
  isExporting.value = true
  try {
    window.location.href = '/api/users/export'
    toast.add({
      title: t('toasts.exportStarted'),
      description: t('toasts.exportStartedDesc'),
      color: 'success'
    })
  } catch (e) {
    console.error(e)
    toast.add({
      title: t('toasts.error'),
      description: t('toasts.exportError'),
      color: 'error'
    })
  } finally {
    isExporting.value = false
  }
}

async function deleteAccount() {
  if (deleteConfirmationText.value !== deleteWord.value) return
  isDeleting.value = true
  try {
    await $fetch('/api/users/delete', {
      method: 'DELETE'
    })
    toast.add({
      title: t('toasts.accountDeleted'),
      description: t('toasts.accountDeletedDesc'),
      color: 'success'
    })
    emit('close')
    await clear()
    window.location.href = '/login'
  } catch (e) {
    console.error(e)
    toast.add({
      title: t('toasts.error'),
      description: t('toasts.deleteError'),
      color: 'error'
    })
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Portabilité des données -->
    <div class="p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 space-y-3">
      <h4 class="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
        <UIcon
          name="i-lucide-download"
          class="text-primary-500 text-lg"
        />
        {{ $t('settings.portabilityTitle') }}
      </h4>
      <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
        {{ $t('settings.portabilityDesc') }}
      </p>
      <UButton
        icon="i-lucide-file-json"
        color="primary"
        variant="solid"
        size="sm"
        class="mt-1"
        :loading="isExporting"
        @click="exportData"
      >
        {{ $t('settings.downloadBtn') }}
      </UButton>
    </div>

    <!-- Droit à l'oubli / Suppression du compte -->
    <div class="p-5 border border-red-500/20 bg-red-500/5 rounded-2xl space-y-3">
      <h4 class="text-sm font-bold text-red-500 flex items-center gap-2">
        <UIcon
          name="i-lucide-trash-2"
          class="text-lg"
        />
        {{ $t('settings.erasureTitle') }}
      </h4>
      <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
        {{ $t('settings.erasureDesc') }}
      </p>

      <div v-if="!showDeleteConfirm">
        <UButton
          color="error"
          variant="soft"
          size="sm"
          class="mt-1"
          @click="showDeleteConfirm = true"
        >
          {{ $t('settings.deleteBtn') }}
        </UButton>
      </div>

      <div
        v-else
        class="space-y-3 mt-2 pt-2 border-t border-red-500/10"
      >
        <p class="text-xs font-semibold text-red-500 leading-normal">
          {{ $t('settings.deleteWarning', { word: deleteWord }) }}
        </p>
        <div class="flex gap-2">
          <UInput
            v-model="deleteConfirmationText"
            type="text"
            :placeholder="$t('settings.deletePlaceholder', { word: deleteWord })"
            class="flex-1"
          />
          <UButton
            color="error"
            :loading="isDeleting"
            :disabled="deleteConfirmationText !== deleteWord"
            @click="deleteAccount"
          >
            {{ $t('settings.confirmBtn') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
