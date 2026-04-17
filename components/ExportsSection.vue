<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface Export {
  key: string
  size: number
  uploaded: string
}

interface Props {
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false
})

const exports = ref<Export[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const creating = ref(false)

const config = useRuntimeConfig()
const baseURL = computed(() => config.app?.baseURL || '')

async function fetchExports() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`${baseURL.value}/api/export`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    exports.value = data.exports || []
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to fetch exports'
  } finally {
    loading.value = false
  }
}

async function createExport() {
  creating.value = true
  try {
    const res = await fetch(`${baseURL.value}/api/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'test-export',
        timestamp: new Date().toISOString(),
        data: { message: 'Test export from Nuxt app' },
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    await fetchExports()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to create export'
  } finally {
    creating.value = false
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString()
}

function getExportId(key: string): string {
  return key.replace('exports/', '')
}

onMounted(() => {
  fetchExports()
})
</script>

<template>
  <div
    :class="[
      'bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700',
      compact ? 'p-3' : 'p-6 rounded-xl'
    ]"
  >
    <div class="flex items-center justify-between mb-2">
      <h3
        :class="[
          'font-bold text-gray-900 dark:text-white flex items-center gap-2',
          compact ? 'text-sm' : 'text-lg'
        ]"
      >
        <span>package</span> Exports
        <span v-if="compact" class="text-xs font-normal text-gray-400">(R2)</span>
      </h3>
      <button
        @click="createExport"
        :disabled="creating"
        :class="[
          'font-medium transition-colors disabled:opacity-50',
          compact
            ? 'text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300'
            : 'text-sm px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700'
        ]"
      >
        {{ creating ? 'Creating...' : compact ? '+ New' : 'Create Export' }}
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="animate-pulse">
      <div
        v-if="compact"
        class="flex gap-2"
      >
        <div v-for="i in 2" :key="i" class="h-8 flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div v-else class="space-y-2">
        <div v-for="i in 3" :key="i" class="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error && exports.length === 0">
      <p :class="['text-red-600 dark:text-red-400', compact ? 'text-xs' : 'text-sm']">
        {{ error }}
      </p>
    </div>

    <!-- Empty state -->
    <div v-else-if="exports.length === 0" class="text-center py-4">
      <p :class="['text-gray-500 dark:text-gray-400', compact ? 'text-xs' : 'text-sm']">
        No exports yet
      </p>
    </div>

    <!-- Compact view -->
    <div v-else-if="compact" class="space-y-1">
      <div
        v-for="exp in exports.slice(0, 3)"
        :key="exp.key"
        class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs"
      >
        <span class="font-mono text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
          {{ getExportId(exp.key) }}
        </span>
        <span class="text-gray-500">{{ formatSize(exp.size) }}</span>
      </div>
      <p v-if="exports.length > 3" class="text-xs text-gray-400 text-center">
        +{{ exports.length - 3 }} more
      </p>
    </div>

    <!-- Full view -->
    <div v-else class="space-y-2">
      <div
        v-for="exp in exports"
        :key="exp.key"
        class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
      >
        <div>
          <p class="font-mono text-sm text-gray-900 dark:text-white">
            {{ getExportId(exp.key) }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ formatDate(exp.uploaded) }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ formatSize(exp.size) }}
          </p>
        </div>
      </div>
    </div>

    <p v-if="!compact && !loading" class="text-xs text-gray-400 dark:text-gray-500 mt-4">
      Stored in Cloudflare R2 (MEDIA bucket)
    </p>
  </div>
</template>
