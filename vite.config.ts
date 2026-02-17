import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'E.A.R. Car Rental Services',
        short_name: 'E.A.R. Car Rental',
        description: 'Premium car rental services in Puerto Princesa, El Nido & Palawan',
        theme_color: '#1F4B57',
        background_color: '#AFC1CC',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'https://github.com/bxxmzilla1/ear_car-rental/blob/main/logo.jpeg?raw=true', sizes: '192x192', type: 'image/jpeg', purpose: 'any maskable' },
          { src: 'https://github.com/bxxmzilla1/ear_car-rental/blob/main/logo.jpeg?raw=true', sizes: '512x512', type: 'image/jpeg', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
