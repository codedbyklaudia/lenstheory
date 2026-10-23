import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // In development, forward every /api request to the Express server.
    // The browser only ever talks to localhost:5173, so the login cookie is a normal
    // same-site cookie. In production, vercel.json does the same job.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
