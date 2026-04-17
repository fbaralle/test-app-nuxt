<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface BackendEnvResponse {
  timestamp: string
  environment: string
  total: number
  filtered: number
  hidden: number
  envVarNames: string[]
}

interface Props {
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false
})

const config = useRuntimeConfig()
const basePath = computed(() => (config.app.baseURL || '').replace(/\/$/, ''))

const backendEnv = ref<BackendEnvResponse | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const isExpanded = ref(false)

// Get frontend env var names from useRuntimeConfig
const frontendEnvNames = computed(() => {
  const publicConfig = config.public || {}
  return Object.keys(publicConfig).sort()
})

async function fetchBackendEnv() {
  try {
    const res = await fetch(`${basePath.value}/api/env-debug`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    backendEnv.value = await res.json()
    error.value = null
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to fetch'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBackendEnv()
})
</script>

<template>
  <div v-if="loading" :class="['bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700', compact ? 'p-3' : 'p-6']">
    <h3 :class="['font-bold text-gray-900 dark:text-white flex items-center gap-2', compact ? 'text-sm mb-2' : 'text-lg mb-4']">
      <span>Env Debug</span>
    </h3>
    <div class="animate-pulse flex gap-3">
      <div :class="['bg-gray-200 dark:bg-gray-700 rounded', compact ? 'h-10 flex-1' : 'h-16 flex-1']" />
      <div :class="['bg-gray-200 dark:bg-gray-700 rounded', compact ? 'h-10 flex-1' : 'h-16 flex-1']" />
    </div>
  </div>

  <div v-else-if="error" :class="['bg-white dark:bg-gray-900 rounded-lg border border-red-200 dark:border-red-800', compact ? 'p-3' : 'p-6']">
    <h3 :class="['font-bold text-gray-900 dark:text-white flex items-center gap-2', compact ? 'text-sm mb-1' : 'text-lg mb-2']">
      <span>Env Debug</span>
    </h3>
    <p :class="['text-red-600 dark:text-red-400', compact ? 'text-xs' : 'text-sm']">
      {{ error }}
    </p>
  </div>

  <div v-else-if="compact" class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
    <button
      @click="isExpanded = !isExpanded"
      class="w-full text-left"
    >
      <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-between">
        <span class="flex items-center gap-2">
          Env Debug
          <span class="text-xs font-normal text-gray-400">(Names Only)</span>
        </span>
        <svg
          :class="['w-4 h-4 text-gray-400 transition-transform', isExpanded ? 'rotate-180' : '']"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </h3>
    </button>
    <div class="flex gap-2">
      <div class="text-center p-2 bg-blue-50 dark:bg-blue-900/30 rounded flex-1">
        <p class="text-lg font-bold text-blue-600 dark:text-blue-400">
          {{ frontendEnvNames.length }}
        </p>
        <p class="text-xs text-gray-500">Frontend</p>
      </div>
      <div class="text-center p-2 bg-purple-50 dark:bg-purple-900/30 rounded flex-1">
        <p class="text-lg font-bold text-purple-600 dark:text-purple-400">
          {{ backendEnv?.filtered || 0 }}
        </p>
        <p class="text-xs text-gray-500">Backend</p>
      </div>
    </div>
    <div v-if="isExpanded" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
      <div>
        <h4 class="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Frontend ({{ frontendEnvNames.length }})</h4>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="name in frontendEnvNames"
            :key="name"
            class="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded font-mono"
          >
            {{ name }}
          </span>
          <span v-if="frontendEnvNames.length === 0" class="text-xs text-gray-400 italic">None available</span>
        </div>
      </div>
      <div>
        <h4 class="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
          Backend ({{ backendEnv?.filtered || 0 }})
          <span v-if="backendEnv && backendEnv.hidden > 0" class="text-gray-400 font-normal"> - {{ backendEnv.hidden }} hidden</span>
        </h4>
        <div class="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
          <span
            v-for="name in backendEnv?.envVarNames || []"
            :key="name"
            class="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded font-mono"
          >
            {{ name }}
          </span>
          <span v-if="!backendEnv || backendEnv.envVarNames.length === 0" class="text-xs text-gray-400 italic">None available</span>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
      <span>Environment Variables Debug</span>
      <span class="text-xs font-normal text-gray-400">(Names Only)</span>
    </h3>
    <div class="flex gap-6 mb-6">
      <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex-1">
        <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">
          {{ frontendEnvNames.length }}
        </p>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Frontend Vars</p>
      </div>
      <div class="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex-1">
        <p class="text-3xl font-bold text-purple-600 dark:text-purple-400">
          {{ backendEnv?.filtered || 0 }}
        </p>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Backend Vars</p>
      </div>
    </div>
    <div class="space-y-4">
      <div>
        <h4 class="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Frontend Environment</h4>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="name in frontendEnvNames"
            :key="name"
            class="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded font-mono"
          >
            {{ name }}
          </span>
          <span v-if="frontendEnvNames.length === 0" class="text-sm text-gray-400 italic">No frontend env vars available</span>
        </div>
      </div>
      <div>
        <h4 class="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
          Backend Environment
          <span v-if="backendEnv && backendEnv.hidden > 0" class="text-gray-400 font-normal ml-2">({{ backendEnv.hidden }} sensitive vars hidden)</span>
        </h4>
        <div class="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          <span
            v-for="name in backendEnv?.envVarNames || []"
            :key="name"
            class="text-sm px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded font-mono"
          >
            {{ name }}
          </span>
          <span v-if="!backendEnv || backendEnv.envVarNames.length === 0" class="text-sm text-gray-400 italic">No backend env vars available</span>
        </div>
      </div>
    </div>
    <p class="text-xs text-gray-400 dark:text-gray-500 mt-4">
      Shows env var names only (not values) for debugging. Sensitive vars (containing SECRET, KEY, TOKEN, etc.) are hidden.
    </p>
  </div>
</template>
