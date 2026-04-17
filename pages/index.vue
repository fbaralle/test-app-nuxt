<script setup lang="ts">
import CryptoDashboard from '~/components/CryptoDashboard.vue'
import FavoritesSection from '~/components/FavoritesSection.vue'
import PageViewsSection from '~/components/PageViewsSection.vue'
import FeatureFlagsSection from '~/components/FeatureFlagsSection.vue'
import ExportsSection from '~/components/ExportsSection.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <header class="pt-10 pb-6 text-center">
      <p class="text-xs font-medium uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
        Webflow Cloud Test App
      </p>
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
        Crypto Dashboard
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-300">
        Live market data from CoinGecko
      </p>
    </header>
    <main class="flex-1 px-4 pb-12">
      <!-- Favorites above main content -->
      <FavoritesSection />

      <!-- Main dashboard content -->
      <CryptoDashboard />

      <!-- KV/R2 sections below in compact mode -->
      <div class="w-full max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <PageViewsSection :compact="true" />
        <FeatureFlagsSection :compact="true" />
        <ExportsSection :compact="true" />
      </div>
    </main>
    <footer class="border-t border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 backdrop-blur">
      <div class="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
        <p>Webflow Cloud Test App — for internal testing purposes only</p>
        <p>Nuxt + Vue Query + Tailwind CSS</p>
      </div>
    </footer>
  </div>
</template>
