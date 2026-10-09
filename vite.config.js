import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Default is js/css/html; woff2 too so the board fonts work offline.
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2}'],
      },
      manifest: {
        name: 'Sahabi',
        short_name: 'Sahabi',
        description: 'Community service app for Melapalayam',
        theme_color: '#16a34a', // green-600, matches your design system
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})