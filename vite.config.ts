import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.API_PROXY_TARGET || 'http://localhost:5140'
  // Preserve API paths: /health is outside /api in the backend contract.
  const proxy = {
    '^/health(?:\\?|$)': { target, changeOrigin: true },
    '^/api(?:/|\\?|$)': { target, changeOrigin: true },
  }

  return {
    plugins: [react()],
    server: { host: '127.0.0.1', port: 5173, strictPort: true, proxy },
    preview: { host: '127.0.0.1', port: 4173, strictPort: true, proxy },
  }
})
