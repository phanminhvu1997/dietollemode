import { StatusCodes } from 'http-status-codes'

import bulkUpdate from '../helpers/bulk-update'

import {
  RECHARGE_RESOURCE_LIMIT,
  SHOPIFY_RESOURCE_LIMIT,
} from '../services/constant'

import SubscriptionRecharge from '../infastructure/recharge/SubscriptionRecharge'
import OrderRecharge from '../infastructure/recharge/OrderRecharge'
import ProductShopify from '../infastructure/shopify/ProductShopify'
import CustomerShopify from '../infastructure/shopify/CustomerShopify'
import OrderShopify from '../infastructure/shopify/OrderShopify'

import {
  generateThemePrivateKey,
} from '../logic/task'

export default {
  async migrateSubscriptionRecharge(req, res, next) {
    try {
      const subscriptionRecharge = new SubscriptionRecharge({
        __store: req.__store,
      })

      let page = 1
      await bulkUpdate({
        onUpdateStart: () => {
          console.log('migrating subscription recharge start')
        },
        onUpdateChunk: ({ totalItems }) => {
          console.log('migarated ', totalItems, 'subscription recharge')
        },
        onUpdateFinish: () => {
          console.log('migrating subscription recharge finished')
        },
        handleGetData: async() => {
          const newData = await subscriptionRecharge.getSubscriptionsFromRecharge({
            page,
          })
          const hasNextPage = newData.length === RECHARGE_RESOURCE_LIMIT
          if (hasNextPage) page += 1
          return { newData, params: hasNextPage }
        },
        handleUpdate: async(newData) => {
          await subscriptionRecharge.updateSubscriptions2Db(newData)
        },
      })

      res.sendStatus(StatusCodes.OK)
    } catch (e) {
      console.error('migrateSubscriptionRecharge: ', e)
      next(e)
    }
  },

  async migrateOrderRecharge(req, res, next) {
    try {
      const orderRecharge = new OrderRecharge({
        __store: req.__store,
      })

      let page = 1
      await bulkUpdate({
        onUpdateStart: () => {
          console.log('migrating order recharge start')
        },
        onUpdateChunk: ({ totalItems }) => {
          console.log('migarated ', totalItems, 'order recharge')
        },
        onUpdateFinish: () => {
          console.log('migrating order recharge finished')
        },
        handleGetData: async() => {
          const newData = await orderRecharge.getOrdersFromRecharge({
            page,
          })
          const hasNextPage = newData.length === RECHARGE_RESOURCE_LIMIT
          if (hasNextPage) page += 1
          return { newData, params: hasNextPage }
        },
        handleUpdate: async(newData) => {
          await orderRecharge.updateOrders2Db(newData)
        },
      })

      res.sendStatus(StatusCodes.OK)
    } catch (e) {
      console.error('migrateOrderRecharge: ', e)
      next(e)
    }
  },

  async migrateProductShopify(req, res, next) {
    try {
      const productShopify = new ProductShopify({
        __store: req.__store,
      })

      let params = {
        limit: SHOPIFY_RESOURCE_LIMIT,
      }

      let result = []
      do {
        const products = await productShopify.getProductsFromShopify(params)

        result = [ ...result, ...products ]

        params = products.nextPageParameters
      } while (params !== undefined)

      await productShopify.updateProducts2Db(result)
      res.sendStatus(StatusCodes.OK)
    } catch (e) {
      console.error('migrateProductShopify: ', e)
      next(e)
    }
  },

  async migrateCustomerShopify(req, res, next) {
    try {
      const customerShopify = new CustomerShopify({
        __store: req.__store,
      })

      let params = {
        limit: SHOPIFY_RESOURCE_LIMIT,
        updated_at_min: '2021-01-01',
      }

      let result = 0
      do {
        const customers = await customerShopify.getCustomersFromShopify(params)

        params = customers.nextPageParameters
        await customerShopify.updateCustomers2Db(customers)
        result += customers.length
        console.log(`Migrated ${ result } customer shopify`)
      } while (params !== undefined)
      console.log('Migrated customer shopify DONE')
      res.sendStatus(StatusCodes.OK)
    } catch (e) {
      console.error('migrateCustomerShopify: ', e)
      next(e)
    }
  },

  async migrateOrderShopify(req, res, next) {
    try {
      const orderShopify = new OrderShopify({
        __store: req.__store,
      })

      let params = {
        limit: SHOPIFY_RESOURCE_LIMIT,
      }

      let result = []
      do {
        const orders = await orderShopify.getOrdersFromShopify(params)

        result = [ ...result, ...orders ]

        params = orders.nextPageParameters
      } while (params !== undefined)

      await orderShopify.updateOrders2Db(result)
      res.sendStatus(StatusCodes.OK)
    } catch (e) {
      console.error('migrateOrderShopify: ', e)
      next(e)
    }
  },

  async updateThemePrivateKey(req, res, next) {
    try {
      await generateThemePrivateKey({
        __store: req.__store,
      })
      res.json({})
    } catch (error) {
      console.error('updateThemePrivateKey ', error)
      next(error)
    }
  },
}
