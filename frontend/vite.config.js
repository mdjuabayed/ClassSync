import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration.
// In Stage 4 we will add a "server.proxy" entry here so that
// fetch('/api/...') calls from React reach the Express backend.
export default defineConfig({
  plugins: [react()],
})
