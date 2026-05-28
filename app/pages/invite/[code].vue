<script setup lang="ts">
const route = useRoute()
const chatStore = useChatStore()
const { t } = useI18n()
const code = route.params.code as string

const isLoading = ref(true)
const isJoining = ref(false)
const hasError = ref(false)
const errorMsg = ref('')
const serverInfo = ref<{ id: string, name: string, ownerName: string } | null>(null)

onMounted(async () => {
  if (!code) {
    hasError.value = true
    errorMsg.value = t('invite.joinErrorDesc')
    isLoading.value = false
    return
  }

  try {
    // Récupérer les métadonnées du serveur
    serverInfo.value = await $fetch<{ id: string, name: string, ownerName: string }>(
      `/api/servers/invite-info?inviteCode=${code}`
    )
  } catch (e) {
    console.error(e)
    hasError.value = true
    errorMsg.value = (e as { statusMessage?: string }).statusMessage || t('invite.joinErrorDesc')
  } finally {
    isLoading.value = false
  }
})

async function joinServer() {
  if (!code || isJoining.value) return
  isJoining.value = true
  try {
    const joinedServer = await $fetch<{ id: string }>('/api/servers/join', {
      method: 'POST',
      body: { inviteCode: code }
    })

    // Actualiser la liste des serveurs et sélectionner le serveur rejoint
    await chatStore.fetchServers()
    await chatStore.selectServer(joinedServer.id)

    // Rediriger vers l'application principale
    await navigateTo('/')
  } catch (e) {
    console.error(e)
    hasError.value = true
    errorMsg.value = (e as { statusMessage?: string }).statusMessage || t('invite.joinErrorDesc')
  } finally {
    isJoining.value = false
  }
}
</script>

<template>
  <div class="min-h-screen w-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 font-sans">
    <div
      class="max-w-md w-full bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden transition-all duration-300"
    >
      <!-- Ambient light effect -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

      <!-- LOADING STATE -->
      <div
        v-if="isLoading"
        class="flex flex-col items-center text-center py-8 space-y-6"
      >
        <div class="relative w-16 h-16 flex items-center justify-center">
          <span class="absolute w-full h-full rounded-full border-4 border-primary-500/20 animate-ping" />
          <span class="absolute w-12 h-12 rounded-full border-4 border-t-primary-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <UIcon
            name="i-lucide-user-plus"
            class="text-2xl text-primary-500 animate-pulse"
          />
        </div>
        <div class="space-y-2">
          <h2 class="text-xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
            {{ t('invite.joiningTitle') }}
          </h2>
          <p class="text-sm text-zinc-500 dark:text-zinc-400">
            {{ t('invite.joiningSubtitle') }}
          </p>
        </div>
      </div>

      <!-- ERROR STATE -->
      <div
        v-else-if="hasError"
        class="flex flex-col items-center text-center py-6 space-y-6 animate-fade-in"
      >
        <div class="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <UIcon
            name="i-lucide-alert-triangle"
            class="text-3xl"
          />
        </div>
        <div class="space-y-2">
          <h2 class="text-xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
            {{ t('invite.joinErrorTitle') }}
          </h2>
          <p class="text-sm text-rose-500 dark:text-rose-400 max-w-xs leading-relaxed">
            {{ errorMsg }}
          </p>
        </div>
        <UButton
          to="/"
          color="neutral"
          variant="solid"
          icon="i-lucide-arrow-left"
          size="md"
        >
          {{ t('invite.backHome') }}
        </UButton>
      </div>

      <!-- CONFIRMATION STATE -->
      <div
        v-else-if="serverInfo"
        class="flex flex-col items-center text-center py-4 space-y-6 animate-fade-in"
      >
        <!-- Server circle placeholder -->
        <UAvatar
          :text="serverInfo.name.charAt(0).toUpperCase()"
          size="3xl"
        />

        <div class="space-y-2">
          <span class="text-xs font-bold text-primary-500 uppercase tracking-widest">
            {{ t('invite.confirmTitle') }}
          </span>
          <h2 class="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
            {{ serverInfo.name }}
          </h2>
          <p class="text-sm text-zinc-500 dark:text-zinc-400">
            {{ t('invite.createdBy') }} <span class="font-semibold text-zinc-700 dark:text-zinc-300">{{ serverInfo.ownerName }}</span>
          </p>
        </div>

        <div class="w-full space-y-2 pt-4">
          <UButton
            color="primary"
            size="lg"
            block
            :loading="isJoining"
            icon="i-lucide-check"
            @click="joinServer"
          >
            {{ isJoining ? t('invite.joiningProgress') : t('invite.joinBtn') }}
          </UButton>
          <UButton
            to="/"
            color="neutral"
            variant="ghost"
            size="lg"
            block
          >
            {{ t('invite.cancelBtn') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
