<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface PageViewsData {
  totalViews: number
  uniqueVisitors: number
}

interface TrackResponse {
  success: boolean
  totalViews: number
  isNewVisitor: boolean
  visitorId: string
}

interface Props {
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false
})

const VISITOR_ID_KEY = 'crypto_dashboard_visitor_id'

const data = ref<PageViewsData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const hasTracked = ref(false)

const config = useRuntimeConfig()
const basePath = computed(() => config.public.apiMountPath || '')

function getVisitorId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(VISITOR_ID_KEY)
}

function setVisitorId(id: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(VISITOR_ID_KEY, id)
}

async function fetchPageViews() {
  try {
    const res = await fetch(`${basePath.value}/api/pageviews`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (json.error) throw new Error(json.error)
    data.value = {
      totalViews: json.totalViews,
      uniqueVisitors: json.uniqueVisitors,
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to fetch page views'
  } finally {
    loading.value = false
  }
}

async function trackPageView() {
  if (hasTracked.value) return
  hasTracked.value = true

  try {
    const visitorId = getVisitorId()
    const res = await fetch(`${basePath.value}/api/pageviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const result = (await res.json()) as TrackResponse
    if (result.visitorId) {
      setVisitorId(result.visitorId)
    }
    // Refresh the data after tracking
    await fetchPageViews()
  } catch (e) {
    // Silently fail for tracking
    console.error('Failed to track page view:', e)
  }
}

onMounted(() => {
  fetchPageViews()
  trackPageView()
})
</script>

<template>
  <!-- Loading state -->
  <div
    v-if="loading"
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
      <span>eye</span> Page Views
    </h3>
    <div class="animate-pulse flex gap-3">
      <div :class="['bg-gray-200 dark:bg-gray-700 rounded', compact ? 'h-10 flex-1' : 'h-16 w-32']" />
      <div :class="['bg-gray-200 dark:bg-gray-700 rounded', compact ? 'h-10 flex-1' : 'h-16 w-32']" />
    </div>
  </div>

  <!-- Error state -->
  <div
    v-else-if="error"
    :class="[
      'bg-white dark:bg-gray-900 rounded-lg border border-red-200 dark:border-red-800',
      compact ? 'p-3' : 'p-6 rounded-xl'
    ]"
  >
    <h3
      :class="[
        'font-bold text-gray-900 dark:text-white flex items-center gap-2',
        compact ? 'text-sm mb-1' : 'text-lg mb-2'
      ]"
    >
      <span>eye</span> Page Views
    </h3>
    <p :class="['text-red-600 dark:text-red-400', compact ? 'text-xs' : 'text-sm']">
      {{ error }}
    </p>
  </div>

  <!-- Compact view -->
  <div
    v-else-if="compact"
    class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3"
  >
    <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
      <span>eye</span> Page Views
      <span class="text-xs font-normal text-gray-400">(KV)</span>
    </h3>
    <div class="flex gap-2">
      <div class="text-center p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded flex-1">
        <p class="text-lg font-bold text-indigo-600 dark:text-indigo-400">
          {{ data?.totalViews?.toLocaleString() || 0 }}
        </p>
        <p class="text-xs text-gray-500">Views</p>
      </div>
      <div class="text-center p-2 bg-green-50 dark:bg-green-900/30 rounded flex-1">
        <p class="text-lg font-bold text-green-600 dark:text-green-400">
          {{ data?.uniqueVisitors?.toLocaleString() || 0 }}
        </p>
        <p class="text-xs text-gray-500">Unique</p>
      </div>
    </div>
  </div>

  <!-- Full view -->
  <div
    v-else
    class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
  >
    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
      <span>eye</span> Page Views
    </h3>
    <div class="flex gap-6">
      <div class="text-center p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex-1">
        <p class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
          {{ data?.totalViews?.toLocaleString() || 0 }}
        </p>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Views</p>
      </div>
      <div class="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg flex-1">
        <p class="text-3xl font-bold text-green-600 dark:text-green-400">
          {{ data?.uniqueVisitors?.toLocaleString() || 0 }}
        </p>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Unique Visitors</p>
      </div>
    </div>
    <p class="text-xs text-gray-400 dark:text-gray-500 mt-4">
      Stored in Cloudflare KV (SESSIONS namespace)
    </p>
  </div>
</template>
