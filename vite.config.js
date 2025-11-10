import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'permissive-csp-header',
      // Use configureServer with higher priority to override default CSP
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Remove any restrictive CSP that might already be set
          res.removeHeader('Content-Security-Policy')
          res.removeHeader('Content-Security-Policy-Report-Only')
          
          // Set permissive CSP to allow blob: URLs for frames and media
          // This is for development; production should be more restrictive
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
      }
    }
  ],
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
      // Lesson Service (lessons) - port 8083
      '/api/lessons': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.log('proxy error (lesson)', err)
          })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to Lesson Service:', req.method, req.url)
            proxyReq.setHeader('Origin', 'http://localhost:5176')
            // Log headers being sent
            console.log('Request headers:', req.headers)
          })
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from Lesson Service:', proxyRes.statusCode, req.url)
            console.log('Response headers:', proxyRes.headers)
          })
        },
      },
      // Document Service (documents) - port 8084
      '/api/documents': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.log('proxy error (document)', err)
          })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to Document Service:', req.method, req.url)
            proxyReq.setHeader('Origin', 'http://localhost:8084')
            // Log incoming client headers so we can verify Authorization is present
            try {
              console.log('Document proxy - incoming request headers:', req.headers)
              // Ensure Authorization header is forwarded to the target
              const incomingAuth = req.headers && (req.headers.authorization || req.headers.Authorization)
              if (incomingAuth) {
                try {
                  proxyReq.setHeader('Authorization', incomingAuth)
                  console.log('Document proxy - forwarded Authorization header')
                } catch (e) {
                  console.log('Document proxy - could not set Authorization on proxyReq', e)
                }
              }
              // proxyReq may expose getHeader in some versions
              if (proxyReq.getHeader) console.log('Document proxy - proxyReq.getHeader(authorization):', proxyReq.getHeader('authorization'))
            } catch (e) {
              console.log('Could not log proxy headers', e)
            }
          })
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from Document Service:', proxyRes.statusCode, req.url)
          })
        },
      },
    },
  },
})
