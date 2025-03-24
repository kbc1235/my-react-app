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
  },
  build: {
    // 청크 사이즈 및 분할 전략 조정
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'chart': ['chart.js', 'react-chartjs-2'],
          'vendor': ['react', 'react-dom']
        }
      }
    },
    // 소스맵 생성
    sourcemap: true,
    // 최적화 옵션
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        pure_funcs: ['console.log']
      }
    }
  },
  optimizeDeps: {
    include: ['chart.js', 'react-chartjs-2']
  }
})
