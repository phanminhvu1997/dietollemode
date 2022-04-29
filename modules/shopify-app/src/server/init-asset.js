import { createProxyMiddleware } from 'http-proxy-middleware'

export default function initAsset(app) {
  if (process.env.NODE_ENV !== 'development') {
    return app
  }

  app.use([
    '/css',
    '/js',
    '/img'
  ],
  createProxyMiddleware({
    target: process.env.DEV_SERVER,
    changeOrigin: true,
  })
  )

  return app
}
