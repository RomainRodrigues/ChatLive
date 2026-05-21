<template>
  <div class="h-full flex flex-col items-center justify-center text-center px-8 bg-zinc-50/50 dark:bg-zinc-900/20 my-auto">
    <!-- Icon Container with sleek shadow -->
    <div class="w-32 h-32 bg-white dark:bg-zinc-800 rounded-3xl shadow-xl shadow-black/5 flex items-center justify-center mb-8 border border-zinc-100 dark:border-zinc-700 hover:scale-105 transition-transform duration-300">
      <UIcon
        name="i-lucide-sparkles"
        class="text-5xl text-primary-500 animate-pulse"
      />
    </div>

    <!-- Text Information -->
    <h1 class="text-3xl font-bold tracking-tight mb-4">
      Bienvenue sur ChatLive
    </h1>
    <p class="text-zinc-500 dark:text-zinc-400 max-w-md text-lg leading-relaxed">
      Sélectionnez un serveur dans la barre latérale gauche ou créez-en un nouveau pour commencer à discuter avec votre communauté.
    </p>
  </div>
</template>
