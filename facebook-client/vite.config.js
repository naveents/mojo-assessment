import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 5173,
    base: "./",
    strictPort: true,
    allowedHosts: 'facebook-client-react.onrender.com'
  },
  build: {
    outDir: 'dist',
  }
});
