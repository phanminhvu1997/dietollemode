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
import OrderTeezilyModel from '../models/TeezilyOrder'

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
      let teezily_order = []
      const Teezily_token = process.env.TEEZILY_TOKEN
      const Shopify_token = process.env.SHOPIFY_ACCESS_TOKEN

      const Order_Unfullfilled_Db = await OrderTeezilyModel.find({
        order_status: 'unfullfiled'
      }).lean()

      for (let i = 0; i < Order_Unfullfilled_Db.length; i++) {
        const teezily_url = 'https://plus.teezily.com/api/v1/orders/' + Order_Unfullfilled_Db[i].teezily_order_id + '.json'

        await axios.get(teezily_url, { headers: { Authorization: Teezily_token } })
          .then(response => {
            teezily_order = response.data.orders[0]
          })
          .catch((error) => {
            console.log('error ' + error)
          })
        if (teezily_order.state === 'Done') {
          const shopify_order_url = 'https://dietollemode.myshopify.com/admin/api/2022-04/orders/' + teezily_order.order_seller_id + '.json'

          let fulfillment_order_line_items = []

          const shopify_order = await axios.get(shopify_order_url, { headers: { 'X-Shopify-Access-Token': Shopify_token } })
            .then(response => {
              response.data.line_items.forEach(line_item => {
                let style_id = '', color_id = '', prototype_id = '', size_id = ''
                for (let i = 0; i < line_item.properties.length; i++) {
                  line_items.properties[i].name === 'style_id' ? style_id = line_item.properties[i].value : ''
                  line_items.properties[i].name === 'color_id' ? color_id = line_item.properties[i].value : ''
                  line_items.properties[i].name === 'prototype_id' ? prototype_id = line_item.properties[i].value : ''
                  line_items.properties[i].name === 'size_id' ? size_id = line_item.properties[i].value : ''
                }
                if (style_id !== '' && color_id !== '' && prototype_id !== '' && size_id !== '') {
                  fulfillment_order_line_items.push({
                    'id': line_item.id,
                    'quantity': line_item.quantity
                  })
                }
              })
            })

          let line_items_by_fulfillment_order = []
          let fulfillment_orders_url = 'https://dietollemode.myshopify.com/admin/api/2022-04/orders/' + teezily_order.order_seller_id + '/fulfillment_orders.json'
          const fulfillment_orders_call = await axios.get(fulfillment_orders_url, { headers: { 'X-Shopify-Access-Token': Shopify_token } })
            .then(response => {
              line_items_by_fulfillment_order.push({
                'fulfillment_order_id': response.data.fulfillment_orders[0].id,
                fulfillment_order_line_items
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
        const updateOrder = await OrderTeezilyModel.findOneAndUpdate({ shopify_order_id: Order_Unfullfilled_Db[i].shopify_order_id }, {
          order_status: 'fullfiled'
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
