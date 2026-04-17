<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface FeatureFlags {
  [key: string]: boolean
}

interface FlagsResponse {
  flags: FeatureFlags
  error?: string
}

interface Props {
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false
})

const flags = ref<FeatureFlags>({})
const loading = ref(true)
const error = ref<string | null>(null)
const updating = ref<string | null>(null)

const config = useRuntimeConfig()
const basePath = computed(() => (config.app.baseURL || '').replace(/\/$/, ''))

const FLAG_LABELS: Record<string, { label: string; description: string }> = {
  dark_mode: { label: 'Dark Mode', description: 'Enable dark theme' },
  show_favorites: { label: 'Favorites', description: 'Show favorites section' },
  show_exports: { label: 'Exports', description: 'Show exports section' },
  show_page_views: { label: 'Page Views', description: 'Show page views section' },
  experimental_features: { label: 'Experimental', description: 'Enable experimental features' },
}

async function fetchFlags() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`${basePath.value}/api/flags`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as FlagsResponse
    if (data.error) {
      error.value = data.error
    }
    flags.value = data.flags || {}
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to fetch flags'
  } finally {
    loading.value = false
  }
}

async function toggleFlag(flag: string) {
  updating.value = flag
  try {
    const newValue = !flags.value[flag]
    const res = await fetch(`${basePath.value}/api/flags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flag, value: newValue }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    flags.value[flag] = newValue
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to update flag'
  } finally {
    updating.value = null
  }
}

onMounted(() => {
  fetchFlags()
})
</script>

<template>
  <div
    :class="[
      'bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700',
      compact ? 'p-3' : 'p-6 rounded-xl'
    ]"
  >
    <h3
      :class="[
        'font-bold text-gray-900 dark:text-white flex items-center gap-2',
        compact ? 'text-sm mb-2' : 'text-lg mb-4'
      ]"
    >
      <span>flags</span> Feature Flags
      <span v-if="compact" class="text-xs font-normal text-gray-400">(KV)</span>
    </h3>

    <!-- Loading state -->
    <div v-if="loading" class="animate-pulse">
      <div
        v-if="compact"
        class="flex gap-2 flex-wrap"
      >
        <div v-for="i in 4" :key="i" class="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div v-else class="space-y-3">
        <div v-for="i in 4" :key="i" class="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error && Object.keys(flags).length === 0">
      <p :class="['text-red-600 dark:text-red-400', compact ? 'text-xs' : 'text-sm']">
        {{ error }}
      </p>
    </div>

    <!-- Compact view -->
    <div v-else-if="compact" class="flex gap-2 flex-wrap">
      <button
        v-for="(value, flag) in flags"
        :key="flag"
        @click="toggleFlag(flag as string)"
        :disabled="updating === flag"
        :class="[
          'px-2 py-1 rounded text-xs font-medium transition-colors',
          value
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
          updating === flag ? 'opacity-50' : 'hover:opacity-80'
        ]"
      >
        {{ FLAG_LABELS[flag as string]?.label || flag }}
      </button>
    </div>

    <!-- Full view -->
    <div v-else class="space-y-3">
      <div
        v-for="(value, flag) in flags"
        :key="flag"
        class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
      >
        <div>
          <p class="font-medium text-gray-900 dark:text-white text-sm">
            {{ FLAG_LABELS[flag as string]?.label || flag }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ FLAG_LABELS[flag as string]?.description || flag }}
          </p>
        </div>
        <button
          @click="toggleFlag(flag as string)"
          :disabled="updating === flag"
          role="switch"
          :aria-checked="value"
          :class="[
            'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
            value ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600',
            updating === flag ? 'opacity-50' : ''
          ]"
        >
          <span
            :class="[
              'inline-block h-4 w-4 rounded-full bg-white transition-transform',
              value ? 'translate-x-6' : 'translate-x-1'
            ]"
          />
        </button>
      </div>
    </div>

    <p v-if="!compact && !loading" class="text-xs text-gray-400 dark:text-gray-500 mt-4">
      Stored in Cloudflare KV (FLAGS namespace)
    </p>
  </div>
</template>
