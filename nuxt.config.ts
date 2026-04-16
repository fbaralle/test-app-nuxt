// User's custom Nuxt configuration
export default defineNuxtConfig({
  compatibilityDate: '2025-04-06',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', 'nitro-cloudflare-dev'],
  app: {
    baseURL: process.env.COSMIC_MOUNT_PATH || process.env.NUXT_PUBLIC_BASE_PATH || '',
    head: {
      title: 'Webflow Cloud Test App',
      meta: [
        { name: 'description', content: 'Test Nuxt application for validating Webflow Cloud hosting, builds, and deployments.' }
      ]
    }
  },
  ssr: true,
  nitro: {
    preset: 'cloudflare-pages',
    compressPublicAssets: true,
  },
  experimental: {
    payloadExtraction: true,
  },
});
