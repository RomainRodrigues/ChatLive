<script setup lang="ts">
const isUserSettingsOpen = useState<boolean>('isUserSettingsOpen', () => false)
const activeTab = ref<'profile' | 'gdpr'>('profile')

// Remettre l'onglet actif à profile à chaque fois que la modale s'ouvre
watch(isUserSettingsOpen, (isOpen) => {
  if (isOpen) {
    activeTab.value = 'profile'
  }
})
</script>

<template>
  <UModal
    v-model:open="isUserSettingsOpen"
    :close="true"
    :title="$t('modal.settingsTitle')"
    class="max-w-xl"
  >
    <template #body>
      <!-- Navigation Onglets -->
      <div class="flex gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-6">
        <button
          :class="[
            'px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer',
            activeTab === 'profile'
              ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400'
              : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          ]"
          @click="activeTab = 'profile'"
        >
          <UIcon
            name="i-lucide-user"
            class="mr-2 inline text-base align-text-bottom"
          />
          {{ $t('settings.myProfile') }}
        </button>
        <button
          :class="[
            'px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer',
            activeTab === 'gdpr'
              ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400'
              : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          ]"
          @click="activeTab = 'gdpr'"
        >
          <UIcon
            name="i-lucide-shield-check"
            class="mr-2 inline text-base align-text-bottom"
          />
          {{ $t('settings.gdprTab') }}
        </button>
      </div>

      <!-- Contenu des Onglets -->
      <LazyModalsUserSettingsProfileTab v-if="activeTab === 'profile'" />
      <LazyModalsUserSettingsGdprTab
        v-else-if="activeTab === 'gdpr'"
        @close="isUserSettingsOpen = false"
      />
    </template>
    <template #footer>
      <div class="flex justify-end">
        <UButton
          variant="ghost"
          color="neutral"
          @click="isUserSettingsOpen = false"
        >
          {{ $t('modal.close') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
