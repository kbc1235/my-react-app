import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/notion': {
        target: 'https://api.notion.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/notion/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('프록시 오류:', err);
          });
          proxy.on('proxyReq', (_, req) => {
            console.log('프록시 요청:', req.method, req.url);
          });
        },
      }
    }
  }
})
