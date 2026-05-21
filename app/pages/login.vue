<script setup lang="ts">
definePageMeta({
  layout: false
})
</script>

<template>
  <div class="h-screen w-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white">
    <UCard class="w-full max-w-sm">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UIcon
            name="i-lucide-message-square"
            class="text-3xl text-primary-500"
          />
        </div>
        <h1 class="text-2xl font-bold">
          Connexion
        </h1>
        <p class="text-zinc-500 dark:text-zinc-400 text-sm mt-2">
          Connectez-vous à ChatLive
        </p>
      </div>

      <UButton
        to="/auth/github"
        icon="i-simple-icons-github"
        color="neutral"
        variant="solid"
        block
        external
      >
        Continuer avec GitHub
      </UButton>

      <UButton
        to="/auth/dev"
        icon="i-lucide-bug"
        color="primary"
        variant="soft"
        block
        external
        class="mt-2"
      >
        Connexion Dev (Test Local)
      </UButton>
    </UCard>
  </div>
</template>
