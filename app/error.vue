<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const statusCode = computed(() => props.error?.statusCode || 500)

const title = computed(() => {
  switch (statusCode.value) {
    case 404: return 'Page introuvable'
    case 403: return 'Accès refusé'
    case 500: return 'Erreur serveur'
    default: return 'Une erreur est survenue'
  }
})

const description = computed(() => {
  switch (statusCode.value) {
    case 404: return 'La page que vous recherchez n\'existe pas ou a été déplacée.'
    case 403: return 'Vous n\'avez pas les droits nécessaires pour accéder à cette ressource.'
    case 500: return 'Une erreur interne s\'est produite. Veuillez réessayer plus tard.'
    default: return props.error?.message || 'Une erreur inattendue s\'est produite.'
  }
})

const icon = computed(() => {
  switch (statusCode.value) {
    case 404: return 'i-lucide-search-x'
    case 403: return 'i-lucide-shield-x'
    default: return 'i-lucide-alert-triangle'
  }
})

function handleError() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="min-h-screen w-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans p-4">
    <div class="max-w-md w-full text-center space-y-8">
      <!-- Error Code -->
      <div class="relative">
        <span class="text-[120px] font-black text-zinc-100 dark:text-zinc-900 leading-none select-none">
          {{ statusCode }}
        </span>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-20 h-20 rounded-2xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center">
            <UIcon
              :name="icon"
              class="text-4xl text-primary-500"
            />
          </div>
        </div>
      </div>

      <!-- Text -->
      <div class="space-y-3">
        <h1 class="text-2xl font-bold tracking-tight">
          {{ title }}
        </h1>
        <p class="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto">
          {{ description }}
        </p>
      </div>

      <!-- Action -->
      <UButton
        icon="i-lucide-home"
        color="primary"
        size="lg"
        @click="handleError"
      >
        Retour à l'accueil
      </UButton>
    </div>
  </div>
</template>
