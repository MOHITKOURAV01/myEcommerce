import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'gsap-vendor': ['gsap', '@gsap/react'],
          'framer-vendor': ['framer-motion'],
          'stripe-vendor': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom', 'axios'],
        },
      },
    },
  },
});
