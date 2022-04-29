import { oauth, app as appController } from './controllers'
import bodyParser from 'body-parser'

import storefrontRouter from './routers/storefront'
import shopifyappRouter from './routers/shopify-app'
import webhookRechargeRouter from './routers/webhook-recharge'

import webhookShopifyRouter from './routers/webhook-shopify'
import taskRouter from './routers/task'

import errorHandle from './middlewares/error-handle'

export default function initRoutes(app) {
  // OAUTH
  app.get('/oauth/callback', oauth.handleCallback)

  // Storefront api
  app.use('/storefront', storefrontRouter)

  // shopify app
  app.use('/shopify-app', shopifyappRouter)

  // webhook
  app.use('/wh-recharge', webhookRechargeRouter)
  app.use('/wh-shopify', webhookShopifyRouter)

  // migrate data and other task
  app.use('/task', taskRouter)

  // render unauthenticated React App
  app.get('/', appController.render)

  // handle ValidationError
  app.use(errorHandle)
}
