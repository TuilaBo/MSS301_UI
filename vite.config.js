import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'permissive-csp-header',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          res.removeHeader('Content-Security-Policy')
          res.removeHeader('Content-Security-Policy-Report-Only')

          res.setHeader(
            'Content-Security-Policy',
            "default-src 'self' 'unsafe-inline' data: blob:; " +
              "frame-src 'self' blob: data:; " +
              "media-src 'self' blob: data:; " +
              "object-src 'self' blob: data:; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "font-src 'self' https://fonts.gstatic.com; " +
              "img-src 'self' data: blob:; " +
              "connect-src 'self' http://localhost:* ws://localhost:*;"
          )
          next()
        })
      },
    },
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/oauth2': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
})
