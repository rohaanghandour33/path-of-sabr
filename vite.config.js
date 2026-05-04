import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // 'vercel dev' serves the full project (Vite + API routes) on port 3000.
      // If you run 'vite' directly alongside 'vercel dev --listen 3001', flip this back to 3001.
      '/api': 'http://localhost:3000',
    },
  },
})
