<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface Favorite {
  id: number
  user_id: string
  coin_id: string
  coin_name: string | null
  coin_symbol: string | null
  coin_image: string | null
  created_at: number
}

const favorites = ref<Favorite[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const config = useRuntimeConfig()
const basePath = computed(() => config.public.apiMountPath || '')

async function fetchFavorites() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`${basePath.value}/api/favorites`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    favorites.value = data.favorites || []
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to fetch favorites'
  } finally {
    loading.value = false
  }
}

async function removeFavorite(coinId: string) {
  try {
    const res = await fetch(`${basePath.value}/api/favorites?coin_id=${encodeURIComponent(coinId)}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    favorites.value = favorites.value.filter(f => f.coin_id !== coinId)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to remove favorite'
  }
}

async function addFavorite(coin: { id: string; name: string; symbol: string; image: string }) {
  try {
    const res = await fetch(`${basePath.value}/api/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coin_id: coin.id,
        coin_name: coin.name,
        coin_symbol: coin.symbol,
        coin_image: coin.image
      })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    await fetchFavorites()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to add favorite'
  }
}

function isFavorite(coinId: string): boolean {
  return favorites.value.some(f => f.coin_id === coinId)
}

onMounted(() => {
  fetchFavorites()
})

// Expose methods for parent components
defineExpose({
  addFavorite,
  removeFavorite,
  isFavorite,
  fetchFavorites,
  favorites
})
</script>

<template>
  <div class="w-full max-w-6xl mx-auto mb-8">
    <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Favorite Coins
        </h3>
        <button
          @click="fetchFavorites"
          :disabled="loading"
          class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50"
        >
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>

      <div v-if="error" class="text-red-500 text-sm mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
        {{ error }}
      </div>

      <div v-if="loading && favorites.length === 0" class="flex gap-4 overflow-x-auto pb-2">
        <div v-for="i in 3" :key="i" class="flex-shrink-0 w-40 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
      </div>

      <div v-else-if="favorites.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
        <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        <p>No favorites yet. Star some coins to add them here!</p>
      </div>

      <div v-else class="flex gap-4 overflow-x-auto pb-2">
        <div
          v-for="fav in favorites"
          :key="fav.id"
          class="flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 min-w-[160px] relative group"
        >
          <button
            @click="removeFavorite(fav.coin_id)"
            class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
            title="Remove from favorites"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div class="flex items-center gap-3 mb-2">
            <img
              v-if="fav.coin_image"
              :src="fav.coin_image"
              :alt="fav.coin_name || fav.coin_id"
              class="w-8 h-8 rounded-full"
            />
            <div v-else class="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-bold">
              {{ (fav.coin_symbol || fav.coin_id).slice(0, 2).toUpperCase() }}
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white text-sm">
                {{ fav.coin_name || fav.coin_id }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 uppercase">
                {{ fav.coin_symbol || fav.coin_id }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
