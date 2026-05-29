<script setup lang="ts">
const { locale, setLocale } = useI18n()
definePageMeta({
  layout: false
})
</script>

<template>
  <div class="h-screen w-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white relative">
    <!-- Language Switcher in the top right -->
    <div class="absolute top-6 right-6 flex gap-1.5 bg-white dark:bg-zinc-800 p-1 rounded-xl shadow-sm border border-black/5 dark:border-white/5">
      <UButton
        size="xs"
        :variant="locale === 'fr' ? 'solid' : 'ghost'"
        color="neutral"
        @click="setLocale('fr')"
      >
        FR
      </UButton>
      <UButton
        size="xs"
        :variant="locale === 'en' ? 'solid' : 'ghost'"
        color="neutral"
        @click="setLocale('en')"
      >
        EN
      </UButton>
    </div>

    <UCard class="w-full max-w-sm">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UIcon
            name="i-lucide-message-square"
            class="text-3xl text-primary-500"
          />
        </div>
        <h1 class="text-2xl font-bold">
          {{ $t('auth.login') }}
        </h1>
        <p class="text-zinc-500 dark:text-zinc-400 text-sm mt-2">
          {{ $t('auth.subtitle') }}
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
        {{ $t('auth.github') }}
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
        {{ $t('auth.dev') }}
      </UButton>

      <div class="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
        <i18n-t
          keypath="auth.consent"
          tag="p"
          class="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed"
        >
          <template #terms>
            <NuxtLink
              to="/terms"
              class="text-primary-500 dark:text-primary-400 hover:underline font-medium"
            >
              {{ $t('auth.terms') }}
            </NuxtLink>
          </template>
          <template #privacy>
            <NuxtLink
              to="/privacy"
              class="text-primary-500 dark:text-primary-400 hover:underline font-medium"
            >
              {{ $t('auth.privacy') }}
            </NuxtLink>
          </template>
        </i18n-t>
      </div>
    </UCard>
  </div>
</template>
