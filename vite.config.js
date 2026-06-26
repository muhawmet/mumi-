import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
  test: {
    exclude: ['e2e/**', '.claude/**', 'node_modules/**'],
  },
})
