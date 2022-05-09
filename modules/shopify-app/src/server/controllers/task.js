import { StatusCodes } from 'http-status-codes'

import bulkUpdate from '../helpers/bulk-update'
import { Order } from '@shopify/shopify-api/dist/rest-resources/2022-04/index.js'
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
import fetch from 'node-fetch'
import axios from 'axios'
import Shopify from 'shopify-api-node'

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
        handleGetData: async () => {
          const newData = await subscriptionRecharge.getSubscriptionsFromRecharge({
            page,
          })
          const hasNextPage = newData.length === RECHARGE_RESOURCE_LIMIT
          if (hasNextPage) page += 1
          return { newData, params: hasNextPage }
        },
        handleUpdate: async (newData) => {
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
        handleGetData: async () => {
          const newData = await orderRecharge.getOrdersFromRecharge({
            page,
          })
          const hasNextPage = newData.length === RECHARGE_RESOURCE_LIMIT
          if (hasNextPage) page += 1
          return { newData, params: hasNextPage }
        },
        handleUpdate: async (newData) => {
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
        console.log(`Migrated ${result} customer shopify`)
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

  async updateOrderStatus(req, res) {
    try {

      const teezily_url = process.env.POST_ORDER_URL
      let teezily_order = []
      const Teezily_token = process.env.TEEZILY_TOKEN

      const teezily_call = await axios.get(teezily_url, { headers: { Authorization: Teezily_token } })
        .then(response => {
          teezily_order = response.data.orders
        })
        .catch((error) => {
          console.log('error ' + error)
        })

      const Teezily_fullfilled_orderArr = teezily_order.filter(order => order.state === 'Done')

      const shopify_order_url = 'https://dietollemode.myshopify.com/admin/api/2022-04/orders.json?status=null'
      const Shopify_token = process.env.SHOPIFY_ACCESS_TOKEN
      let shopify_unfullfilled_order = []

      const shopify_call = await axios.get(shopify_order_url, { headers: { 'X-Shopify-Access-Token': Shopify_token } })
        .then(response => {
          shopify_unfullfilled_order = response.data.orders
        })
        .catch((error) => {
          console.log('error ' + error)
        })

      let orders_need_to_fullfill = []

      Teezily_fullfilled_orderArr.forEach(teezily_fullfilled_order => {
        const order = shopify_unfullfilled_order.filter(shopify_order => shopify_order.id.toString() === teezily_fullfilled_order.order_seller_id.toString())
        orders_need_to_fullfill.push(order)
      }
      )

      for (let i = 0; i < orders_need_to_fullfill.length; i++) {
        const fulfillment_orders_url = 'https://dietollemode.myshopify.com/admin/api/2022-04/orders/' + orders_need_to_fullfill[i].id + '/fulfillment_orders.json'
        let line_items_by_fulfillment_order = []
        const fulfillment_orders_call = await axios.get(fulfillment_orders_url, { headers: { 'X-Shopify-Access-Token': Shopify_token } })
          .then(response => {
            line_items_by_fulfillment_order.push({
              'fulfillment_order_id': response.data.fulfillment_orders[0].id,
              'fulfillment_order_line_items': [
                {
                  'id': response.data.fulfillment_orders[0].line_items[0].id,
                  'quantity': response.data.fulfillment_orders[0].line_items[0].quantity
                }
              ]
            })
          })

        const fulfillment = {
          'fulfillment': {
            'notify_customer': false,
            line_items_by_fulfillment_order
          }
        }
        const fulfillments_url = 'https://dietollemode.myshopify.com/admin/api/2022-04/fulfillments.json'
        axios.post(fulfillments_url, fulfillment, { headers: { 'X-Shopify-Access-Token': Shopify_token } })
          // eslint-disable-next-line promise/always-return
          .then((res) => {
            console.log('RESPONSE RECEIVED: ', res)
          })
          .catch((err) => {
            console.log('AXIOS ERROR: ', err)
          })
      }

      res.json('Successfully')
    } catch (error) {
      console.error('updateThemePrivateKey ', error)
      return error
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
