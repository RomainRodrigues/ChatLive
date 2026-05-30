<script setup lang="ts">
const { locale } = useI18n()

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - ChatLive` : 'ChatLive'
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  htmlAttrs: {
    lang: locale
  }
})

useSeoMeta({
  description: 'ChatLive — Messagerie instantanée collaborative avec serveurs, channels et messages privés chiffrés.',
  ogTitle: 'ChatLive',
  ogDescription: 'Messagerie instantanée collaborative avec chiffrement de bout en bout.',
  ogType: 'website',
  twitterCard: 'summary'
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator color="var(--ui-primary)" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
