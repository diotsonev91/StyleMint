import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  assetsInclude: ['**/*.wasm', '**/*.pck'],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  },
    server: {
        port: 5173,
        proxy: {
            // Proxy всички /api заявки към backend-а
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
                // Не пренаписваме path-а, защото backend очаква /api/v1
            }
        }
    }
})