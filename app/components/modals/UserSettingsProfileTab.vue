<script setup lang="ts">
const { locale, setLocale, t } = useI18n()
const { user, fetch: refreshSession } = useUserSession()

const nameInput = ref('')
const isSaving = ref(false)
const toast = useToast()

// Synchroniser le nom d'entrée lorsque le profil utilisateur change ou est initialisé
watch(user, (newUser) => {
  if (newUser) {
    nameInput.value = newUser.name || ''
  }
}, { immediate: true })

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
</script>

<template>
  <div class="space-y-6">
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
        <UInput
          v-model="nameInput"
          type="text"
          :placeholder="$t('settings.namePlaceholder')"
          maxlength="100"
          class="flex-1"
          @keyup.enter="saveProfile"
        />
        <UButton
          color="primary"
          :loading="isSaving"
          @click="saveProfile"
        >
          {{ $t('settings.save') }}
        </UButton>
      </div>
    </div>

    <!-- Sélection de la langue -->
    <div class="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
      <label class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
        {{ $t('settings.appLanguage') }}
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
</template>
