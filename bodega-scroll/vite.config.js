import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' so the built site works when served from any sub-path (Vercel / static host).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 4199, host: true },
  preview: { port: 4199, host: true },
  // Three.js is the bulk of the bundle and is expected here — raise the warning ceiling.
  build: { chunkSizeWarningLimit: 1000 },
})
