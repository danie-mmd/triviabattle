import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    allowedHosts: [
      'animal-alone-buffer-protein.trycloudflare.com',
      'examining-technological-venice-pregnancy.trycloudflare.com',
      'calculators-convergence-cheap-opera.trycloudflare.com',
      'tales-apartments-theology-talk.trycloudflare.com',
      'analyses-dis-directions-attached.trycloudflare.com',
      'aluminium-stronger-layer-taxi.trycloudflare.com',
      'stuck-bought-privileges-orbit.trycloudflare.com'
    ],
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
