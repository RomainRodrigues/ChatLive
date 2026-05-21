<script setup lang="ts">
definePageMeta({
  layout: false
})
</script>

<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-primary-500/30">
    <div class="max-w-3xl mx-auto">
      <!-- Back Button -->
      <div class="mb-8">
        <UButton
          to="/login"
          icon="i-lucide-arrow-left"
          variant="ghost"
          color="neutral"
        >
          {{ $t('terms.back') }}
        </UButton>
      </div>

      <!-- Header with Gradient Title -->
      <div class="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-primary-600 to-indigo-600 text-white p-8 sm:p-12 shadow-xl mb-12">
        <div class="absolute inset-0 bg-grid-white/[0.08] [mask-image:linear-gradient(0deg,white,transparent)]" />
        <div class="relative z-10">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md mb-4 text-white">
            <UIcon
              name="i-lucide-file-text"
              class="text-sm"
            />
            {{ $t('terms.badge') }}
          </span>
          <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {{ $t('terms.title') }}
          </h1>
          <p class="mt-3 text-white/80 text-sm sm:text-base max-w-xl">
            {{ $t('terms.subtitle') }}
          </p>
          <p class="text-xs text-white/60 mt-4">
            {{ $t('terms.lastUpdated') }}
          </p>
        </div>
      </div>

      <!-- Content Sections -->
      <div class="space-y-10 bg-white dark:bg-zinc-900 rounded-3xl p-8 sm:p-10 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
        <!-- Section 1 -->
        <section class="space-y-3">
          <h2 class="text-xl font-bold flex items-center gap-3 text-primary-600 dark:text-primary-400">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950/50 text-sm font-semibold">1</span>
            {{ $t('terms.section1.title') }}
          </h2>
          <p class="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed pl-11">
            {{ $t('terms.section1.content') }}
          </p>
        </section>

        <UDivider class="border-zinc-100 dark:border-zinc-800" />

        <!-- Section 2 -->
        <section class="space-y-3">
          <h2 class="text-xl font-bold flex items-center gap-3 text-primary-600 dark:text-primary-400">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950/50 text-sm font-semibold">2</span>
            {{ $t('terms.section2.title') }}
          </h2>
          <p class="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed pl-11">
            {{ $t('terms.section2.content') }}
          </p>
        </section>

        <UDivider class="border-zinc-100 dark:border-zinc-800" />

        <!-- Section 3 -->
        <section class="space-y-3">
          <h2 class="text-xl font-bold flex items-center gap-3 text-primary-600 dark:text-primary-400">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950/50 text-sm font-semibold">3</span>
            {{ $t('terms.section3.title') }}
          </h2>
          <p class="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed pl-11 mb-2">
            {{ $t('terms.section3.subtitle') }}
          </p>
          <ul class="list-disc pl-16 text-zinc-600 dark:text-zinc-400 text-sm space-y-2">
            <li>{{ $t('terms.section3.item1') }}</li>
            <li>{{ $t('terms.section3.item2') }}</li>
            <li>{{ $t('terms.section3.item3') }}</li>
          </ul>
        </section>

        <UDivider class="border-zinc-100 dark:border-zinc-800" />

        <!-- Section 4 -->
        <section class="space-y-3">
          <h2 class="text-xl font-bold flex items-center gap-3 text-primary-600 dark:text-primary-400">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950/50 text-sm font-semibold">4</span>
            {{ $t('terms.section4.title') }}
          </h2>
          <p class="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed pl-11">
            {{ $t('terms.section4.content') }}
          </p>
        </section>

        <UDivider class="border-zinc-100 dark:border-zinc-800" />

        <!-- Section 5 -->
        <section class="space-y-3">
          <h2 class="text-xl font-bold flex items-center gap-3 text-primary-600 dark:text-primary-400">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950/50 text-sm font-semibold">5</span>
            {{ $t('terms.section5.title') }}
          </h2>
          <p class="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed pl-11">
            {{ $t('terms.section5.content') }}
          </p>
        </section>
      </div>

      <!-- Footer Info -->
      <div class="mt-8 text-center text-xs text-zinc-400">
        ChatLive &copy; 2026 - {{ $t('terms.footer') }}.
      </div>
    </div>
  </div>
</template>
