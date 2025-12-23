import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/add_connect/',
    server: {
    proxy: {
      '/campaignServer': {
        target: 'https://qa.tak.co.il',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
})
