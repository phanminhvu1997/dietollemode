import express from 'express'
import verifyRechargeWebhook from '../middlewares/verify-recharge-webhook'
import { rechargeWebhook } from '../controllers'

const webhookRouter = express.Router()

webhookRouter.get('/register', rechargeWebhook.registerWhRecharge)
webhookRouter.get('/remove', rechargeWebhook.removeWhRecharge)

// middleware that is specific to this router
webhookRouter.use(verifyRechargeWebhook)

webhookRouter.post(
  '/subscription/created',
  rechargeWebhook.subscriptionRechargeCreated
)

webhookRouter.post(
  '/subscription/updated',
  rechargeWebhook.subscriptionRechargeUpdated
)

webhookRouter.post(
  '/subscription/deleted',
  rechargeWebhook.subscriptionRechargeDeleted
)

webhookRouter.post(
  '/order/created',
  rechargeWebhook.orderRechargeCreated
)

webhookRouter.post(
  '/order/updated',
  rechargeWebhook.orderRechargeUpdated
)

export default webhookRouter
