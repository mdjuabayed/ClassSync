import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration.
// The "proxy" forwards every /api request from the React dev server to the
// Express backend, so the browser only ever talks to ONE origin (localhost:5173).
// That is why no CORS package is needed anywhere in the project.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
