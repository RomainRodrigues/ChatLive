<script setup lang="ts">
interface SearchUser {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

const chatStore = useChatStore()
const { t } = useI18n()
const searchQuery = ref('')
const searchResults = ref<SearchUser[]>([])
const isSearching = ref(false)
const emailInput = ref('')
const requestStatus = ref<{ success?: boolean, message?: string } | null>(null)
const isSubmittingRequest = ref(false)

// Rechercher des utilisateurs au fur et à mesure de la saisie
watch(searchQuery, async (newVal) => {
  const query = newVal.trim()
  if (!query) {
    searchResults.value = []
    return
  }
  isSearching.value = true
  try {
    searchResults.value = await $fetch<SearchUser[]>(`/api/users/search?q=${encodeURIComponent(query)}`)
  } catch (e) {
    console.error(e)
  } finally {
    isSearching.value = false
  }
})

async function handleSendRequest(userId: string) {
  try {
    const res = await chatStore.sendFriendRequest(userId, false)
    requestStatus.value = { success: true, message: res.message || t('friends.toastRequestSent') }
    // Enlever de la recherche locale
    searchResults.value = searchResults.value.filter(u => u.id !== userId)
  } catch (e: unknown) {
    const err = e as { statusMessage?: string }
    requestStatus.value = { success: false, message: err.statusMessage || t('friends.toastError') }
  }
}

async function handleSendByEmail() {
  const email = emailInput.value.trim()
  if (!email) return
  isSubmittingRequest.value = true
  requestStatus.value = null
  try {
    const res = await chatStore.sendFriendRequest(email, true)
    requestStatus.value = { success: true, message: res.message || t('friends.toastRequestSent') }
    emailInput.value = ''
  } catch (e: unknown) {
    const err = e as { statusMessage?: string }
    requestStatus.value = { success: false, message: err.statusMessage || t('friends.toastError') }
  } finally {
    isSubmittingRequest.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h2 class="text-xl font-bold text-zinc-950 dark:text-white mb-2">
        {{ $t('friends.addFriendTitle') }}
      </h2>
      <p class="text-sm text-zinc-500">
        {{ $t('friends.addFriendDesc') }}
      </p>
    </div>

    <!-- Section 1 : Ajouter par e-mail direct -->
    <div class="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 flex flex-col gap-4">
      <label class="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{{ $t('friends.addEmailLabel') }}</label>
      <div class="flex gap-2">
        <UInput
          v-model="emailInput"
          type="email"
          :placeholder="$t('friends.addEmailPlaceholder')"
          class="flex-1"
          size="lg"
          @keyup.enter="handleSendByEmail"
        />
        <UButton
          color="primary"
          size="lg"
          :loading="isSubmittingRequest"
          @click="handleSendByEmail"
        >
          {{ $t('friends.sendRequestBtn') }}
        </UButton>
      </div>
    </div>

    <!-- Section 2 : Rechercher par pseudonyme interactif -->
    <div class="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 flex flex-col gap-4">
      <label class="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{{ $t('friends.searchUsersLabel') }}</label>
      <UInput
        v-model="searchQuery"
        type="text"
        icon="i-lucide-search"
        :placeholder="$t('friends.searchUsersPlaceholder')"
        class="w-full"
        size="lg"
      />

      <!-- Liste des résultats de recherche -->
      <div
        v-if="isSearching"
        class="flex flex-col gap-3 py-4"
      >
        <div class="flex items-center gap-3">
          <USkeleton class="w-10 h-10 rounded-full" />
          <div class="flex flex-col gap-1 flex-1">
            <USkeleton class="h-4 w-[40%] rounded-md" />
            <USkeleton class="h-3 w-[25%] rounded-md" />
          </div>
        </div>
      </div>

      <div
        v-else-if="searchResults.length > 0"
        class="flex flex-col gap-2 mt-2 max-h-[300px] overflow-y-auto pr-2"
      >
        <div
          v-for="user in searchResults"
          :key="user.id"
          class="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5 hover:border-primary-500/20 transition-all"
        >
          <div class="flex items-center gap-3">
            <img
              v-if="user.avatarUrl"
              :src="user.avatarUrl"
              :alt="user.name"
              class="w-10 h-10 rounded-full"
            >
            <div
              v-else
              class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-500 flex items-center justify-center font-bold text-lg shrink-0"
            >
              {{ user.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="font-semibold text-zinc-900 dark:text-zinc-100">
                {{ user.name }}
              </div>
              <div class="text-xs text-zinc-400">
                {{ user.email }}
              </div>
            </div>
          </div>
          <UButton
            icon="i-lucide-user-plus"
            color="primary"
            variant="subtle"
            @click="handleSendRequest(user.id)"
          >
            {{ $t('friends.addBtn') }}
          </UButton>
        </div>
      </div>

      <div
        v-else-if="searchQuery.trim() !== ''"
        class="text-sm text-zinc-400 text-center py-4"
      >
        {{ $t('friends.noUserFound', { query: searchQuery }) }}
      </div>
    </div>

    <!-- Alertes de statut de demande d'ami -->
    <Transition name="fade">
      <div
        v-if="requestStatus"
        :class="[
          'p-4 rounded-xl border flex items-start gap-3',
          requestStatus.success
            ? 'bg-green-50 dark:bg-green-950/20 border-green-500/20 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-950/20 border-red-500/20 text-red-700 dark:text-red-400'
        ]"
      >
        <UIcon
          :name="requestStatus.success ? 'i-lucide-check-circle' : 'i-lucide-alert-triangle'"
          class="text-xl shrink-0 mt-0.5"
        />
        <div class="text-sm font-semibold flex-1">
          {{ requestStatus.message }}
        </div>
        <button
          class="text-xs font-bold uppercase tracking-wider opacity-75 hover:opacity-100 cursor-pointer"
          @click="requestStatus = null"
        >
          {{ $t('friends.closeAlertBtn') }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
