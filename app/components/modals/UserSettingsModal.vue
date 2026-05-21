<script setup lang="ts">
const isUserSettingsOpen = useState<boolean>('isUserSettingsOpen', () => false)
const activeTab = ref<'profile' | 'gdpr'>('profile')

const { locale, setLocale, t } = useI18n()
const { user, fetch: refreshSession, clear } = useUserSession()

const nameInput = ref('')
const isSaving = ref(false)
const isExporting = ref(false)
const isDeleting = ref(false)
const showDeleteConfirm = ref(false)
const deleteConfirmationText = ref('')

const toast = useToast()

const deleteWord = computed(() => t('settings.deleteWord'))

// Synchroniser le nom d'entrée lorsque le modal s'ouvre
watch(isUserSettingsOpen, (isOpen) => {
  if (isOpen && user.value) {
    nameInput.value = user.value.name || ''
    showDeleteConfirm.value = false
    deleteConfirmationText.value = ''
  }
})

async function saveProfile() {
  if (!nameInput.value.trim()) return
  isSaving.value = true
  try {
    await $fetch('/api/users/profile', {
      method: 'POST',
      body: { name: nameInput.value.trim() }
    })
    await refreshSession()
    toast.add({
      title: t('toasts.profileUpdated'),
      description: t('toasts.profileUpdatedDesc'),
      color: 'success'
    })
  } catch (e) {
    console.error(e)
    toast.add({
      title: t('toasts.error'),
      description: (e as { statusMessage?: string }).statusMessage || t('toasts.profileUpdateError'),
      color: 'error'
    })
  } finally {
    isSaving.value = false
  }
}

async function exportData() {
  isExporting.value = true
  try {
    // Déclencher le téléchargement direct en redirigeant le navigateur
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
    isUserSettingsOpen.value = false
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
  <UModal
    v-model:open="isUserSettingsOpen"
    :close="true"
    :title="$t('modal.settingsTitle')"
    class="max-w-xl"
  >
    <template #body>
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

      <!-- TAB 1: Profile Editing (Rectification) -->
      <div
        v-if="activeTab === 'profile'"
        class="space-y-6"
      >
        <div class="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/60">
          <img
            v-if="user?.avatarUrl"
            :src="user.avatarUrl"
            :alt="user.name"
            class="w-14 h-14 rounded-full border border-black/5 dark:border-white/5"
          >
          <div
            v-else
            class="w-14 h-14 rounded-full border border-black/5 dark:border-white/5 bg-primary-100 dark:bg-primary-950 text-primary-500 flex items-center justify-center font-bold text-xl"
          >
            {{ user?.name?.charAt(0).toUpperCase() || 'U' }}
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold truncate">
              {{ user?.name }}
            </h4>
            <p class="text-xs text-zinc-400 truncate">
              {{ user?.email }}
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {{ $t('settings.displayName') }}
          </label>
          <div class="flex gap-2">
            <input
              v-model="nameInput"
              type="text"
              :placeholder="$t('settings.namePlaceholder')"
              class="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm"
              @keyup.enter="saveProfile"
            >
            <UButton
              color="primary"
              :loading="isSaving"
              @click="saveProfile"
            >
              {{ $t('settings.save') }}
            </UButton>
          </div>
        </div>

        <!-- Language selection section -->
        <div class="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <label class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {{ locale === 'fr' ? 'Langue de l\'application' : 'Application Language' }}
          </label>
          <div class="flex gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl max-w-[220px] border border-black/5 dark:border-white/5">
            <button
              type="button"
              :class="[
                'flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                locale === 'fr'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              ]"
              @click="setLocale('fr')"
            >
              Français
            </button>
            <button
              type="button"
              :class="[
                'flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                locale === 'en'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              ]"
              @click="setLocale('en')"
            >
              English
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 2: GDPR / Personal Data Rights -->
      <div
        v-else-if="activeTab === 'gdpr'"
        class="space-y-6"
      >
        <!-- Portability -->
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
            class="rounded-xl mt-1"
            :loading="isExporting"
            @click="exportData"
          >
            {{ $t('settings.downloadBtn') }}
          </UButton>
        </div>

        <!-- Right to be forgotten -->
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
              class="rounded-xl mt-1"
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
              <input
                v-model="deleteConfirmationText"
                type="text"
                :placeholder="$t('settings.deletePlaceholder', { word: deleteWord })"
                class="flex-1 bg-white dark:bg-zinc-900 border border-red-500/30 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-red-500 transition-all text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm"
              >
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
