import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
// GitHub Pages 프로젝트 사이트(https://<user>.github.io/gagyebu/)로 배포하므로
// 루트가 아닌 저장소 이름 하위 경로를 base로 지정해야 함.
const base = '/gagyebu/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: '가계부',
        short_name: '가계부',
        description: '개인 수입/지출 관리',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#fcfcfb',
        theme_color: '#2a78d6',
        icons: [
          { src: `${base}pwa-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${base}pwa-512.png`, sizes: '512x512', type: 'image/png' },
          { src: `${base}pwa-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
      },
    }),
  ],
})
