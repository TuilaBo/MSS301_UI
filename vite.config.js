import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Account Service (authentication) - port 8081
      '/api/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.log('proxy error (auth)', err)
          })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to Auth Service:', req.method, req.url)
            proxyReq.setHeader('Origin', 'http://localhost:8081')
          })
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from Auth Service:', proxyRes.statusCode, req.url)
          })
        },
      },
      // Payment Service (memberships & payments) - port 8082
      '/api/memberships': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.log('proxy error (payment)', err)
          })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to Payment Service:', req.method, req.url)
            proxyReq.setHeader('Origin', 'http://localhost:8082')
          })
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from Payment Service:', proxyRes.statusCode, req.url)
          })
        },
      },
      '/api/payments': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.log('proxy error (payment)', err)
          })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to Payment Service:', req.method, req.url)
            proxyReq.setHeader('Origin', 'http://localhost:8082')
          })
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from Payment Service:', proxyRes.statusCode, req.url)
          })
        },
      },
    },
  },
})
