import express from 'express'
import rateLimit from 'express-rate-limit'
import { StatusCodes } from 'http-status-codes'

import { storefront } from '../controllers'
import verifyStorefrontProxy from '../middlewares/verify-proxy'
import verifyThemePrivateKey from '../middlewares/verify-theme-private-key'

import AppModel from '../infastructure/AppModel'

const storefrontRouter = express.Router()
const childRouter = express.Router()

// Middlewares only for storefront router
const getCustomerInfo = async (req, res, next) => {
  try {
    const { customerShopifyId } = req.params

    const customerShopify = new AppModel({
      __store: req.__store,
    })

    const customerOfShopify =
      await customerShopify.CustomerShopifyModel.findOne({
        id: customerShopifyId,
      })
        .lean()
        .exec()

    if (!customerOfShopify) {
      res.sendStatus(StatusCodes.NOT_FOUND)
      return
    }

    req.__customerShopify = customerOfShopify

    next()
  } catch (error) {
    console.error('getCustomerInfo: ', error)
    next(error)
  }
}

storefrontRouter.use(verifyStorefrontProxy)

storefrontRouter.use('/customers/:customerShopifyId', [
  getCustomerInfo,
  childRouter,
])

export default storefrontRouter
