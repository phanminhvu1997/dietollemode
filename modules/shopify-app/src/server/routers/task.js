import express from 'express'
import { StatusCodes } from 'http-status-codes'

import { task } from '../controllers'
import verifyDev from '../middlewares/verify-dev'

const taskRouter = express.Router()

// middleware that is specific to this router
// taskRouter.use(verifyDev((req, res, next) => res.sendStatus(StatusCodes.FORBIDDEN)))

taskRouter.get('/migrate/subscriptions', task.migrateSubscriptionRecharge)
taskRouter.get('/migrate/orders-recharge', task.migrateOrderRecharge)
taskRouter.get('/migrate/products-shopify', task.migrateProductShopify)
taskRouter.get('/migrate/customers-shopify', task.migrateCustomerShopify)
taskRouter.get('/migrate/orders-shopify', task.migrateOrderShopify)
taskRouter.get('/update-theme-private-key', task.updateThemePrivateKey)
taskRouter.get('/update-order-status', task.updateOrderStatus)

export default taskRouter
