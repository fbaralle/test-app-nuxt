export default defineNuxtConfig({
  compatibilityDate: '2025-04-06',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  app: {
    head: {
      title: 'Webflow Cloud Test App',
      meta: [
        { name: 'description', content: 'Test Nuxt application for validating Webflow Cloud hosting, builds, and deployments.' }
      ]
    }
  }
})
