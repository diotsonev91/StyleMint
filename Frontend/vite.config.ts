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
    //DOING THIS BECAUSE IF MAKE IT CORRECT WAY SHOULD CONFIG IN CLOUD AND COULD HAVE BUGS IN EXAM DONT WANT TO HAPPEN
    // I KNOW ITS NOT THE CORRECT WAY
    headers: {
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'same-origin', 
    }
  }
})