import express from 'express'
import verifyShopifyWebhook from '../middlewares/verify-shopify-webhook'
import { shopifyWebhook } from '../controllers'

const webhookRouter = express.Router()

webhookRouter.get('/register', shopifyWebhook.registerWhShopify)
webhookRouter.get('/remove', shopifyWebhook.removeWhShopify)

// middleware that is specific to this router
// webhookRouter.use(verifyShopifyWebhook)

webhookRouter.post(
  '/products/created',
  shopifyWebhook.productShopifyCreated
)

webhookRouter.post(
  '/products/updated',
  shopifyWebhook.productShopifyUpdated
)

webhookRouter.post(
  '/products/deleted',
  shopifyWebhook.productShopifyDeleted
)

webhookRouter.post(
  '/orders/created',
  shopifyWebhook.orderShopifyCreated
)

webhookRouter.post(
  '/orders/updated',
  shopifyWebhook.orderShopifyUpdated
)

webhookRouter.post(
  '/customers/created',
  shopifyWebhook.customerShopifyCreated
)

webhookRouter.post(
  '/customers/updated',
  shopifyWebhook.customerShopifyUpdated
)

webhookRouter.post(
  '/customers/deleted',
  shopifyWebhook.customerShopifyDeleted
)

export default webhookRouter
