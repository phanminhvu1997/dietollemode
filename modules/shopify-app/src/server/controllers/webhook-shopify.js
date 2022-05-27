import { StatusCodes } from 'http-status-codes'

import * as config from '../services/constant'
import ProductShopify from '../infastructure/shopify/ProductShopify'
import OrderShopify from '../infastructure/shopify/OrderShopify'
import StoreModel from '../models/store'
import OrderTeezilyModel from '../models/TeezilyOrder'
import CustomerShopify from '../infastructure/shopify/CustomerShopify'

import fetch from 'node-fetch'


function formatRequestTeezily(data, customer, billing_address, shipping_address, shopifyOrderName) {
  const formatRequestTeezily = {
    email: customer.email,
    first_name: customer.first_name,
    last_name: customer.last_name,
    order_seller_id: shopifyOrderName,
    shipping_address: {
      address: shipping_address.city,
      zipcode: shipping_address.zip,
      city: shipping_address.city,
      province_code: shipping_address.province_code,
      country_code: shipping_address.country_code,
      first_name: shipping_address.first_name,
      last_name: shipping_address.last_name,
    },
    billing_address: {
      address: billing_address.city,
      zipcode: billing_address.zip,
      city: billing_address.city,
      province_code: billing_address.province_code,
      country_code: billing_address.country_code,
      first_name: billing_address.first_name,
      last_name: billing_address.last_name,
    },
    line_items: data,
  }
  return formatRequestTeezily

}

export default {
  async registerWhShopify(req, res) {
    try {
      const host = config.HOST

      const store = await StoreModel.findOne({
        name: config.STORE_NAME,
      })
        .lean()
        .exec()
      const appModel = new ProductShopify({ __store: store })

      const webhooks = [ { topic: 'orders/create', address: '/orders/created' }, {
        topic: 'orders/updated', address: '/orders/updated'
      }, { topic: 'products/create', address: '/products/created' }, {
        topic: 'products/update', address: '/products/updated'
      }, { topic: 'products/delete', address: '/products/deleted' }, {
        topic: 'customers/create', address: '/customers/created'
      }, { topic: 'customers/update', address: '/customers/updated' }, {
        topic: 'customers/delete', address: '/customers/deleted'
      },

      ]
      const registedWebhooks = await appModel.shopifyClient.webhook.list()

      for (const { id } of registedWebhooks) {
        await appModel.shopifyClient.webhook.delete(id)
      }

      const result = []
      for (const webhook of webhooks) {
        const address = `${host}/wh-shopify${webhook.address}`
        const topic = webhook.topic
        const res = await appModel.shopifyClient.webhook.create({
          address, // @ts-ignore
          topic,
        })
        result.push(res)
      }
      res.json(result)
    } catch (error) {
      console.error('registerWhShopify: ', error)
      res.sendStatus(StatusCodes.SERVICE_UNAVAILABLE)
    }
  },

  async removeWhShopify(req, res) {
    try {
      const store = await StoreModel.findOne({
        name: config.STORE_NAME,
      })
        .lean()
        .exec()
      const appModel = new ProductShopify({ __store: store })

      const registedWebhooks = await appModel.shopifyClient.webhook.list()

      for (const { id } of registedWebhooks) {
        await appModel.shopifyClient.webhook.delete(id)
      }

      res.json({})
    } catch (error) {
      console.error('removeWhShopify: ', error)
      res.sendStatus(StatusCodes.SERVICE_UNAVAILABLE)
    }
  },

  async productShopifyCreated(req, res) {
    try {
      const productShopify = new ProductShopify({ __store: req.__store })
      await productShopify.updateProducts2Db([ req.body ])

      res.sendStatus(StatusCodes.OK)
    } catch (error) {
      console.error('productShopifyCreated: ', error)
      res.sendStatus(StatusCodes.SERVICE_UNAVAILABLE)
    }
  },

  async productShopifyUpdated(req, res) {
    try {
      const productShopify = new ProductShopify({ __store: req.__store })
      await productShopify.updateProducts2Db([ req.body ])
      res.sendStatus(StatusCodes.OK)
    } catch (error) {
      console.error('productShopifyUpdated: ', error)
      res.sendStatus(StatusCodes.SERVICE_UNAVAILABLE)
    }
  },

  async productShopifyDeleted(req, res) {
    try {
      const productShopify = new ProductShopify({ __store: req.__store })
      await productShopify.ProductShopifyModel.findOneAndDelete({
        id: req.body.id,
      })
        .lean()
        .exec()

      res.sendStatus(StatusCodes.OK)
    } catch (error) {
      console.error('productShopifyDeleted: ', error)
      res.sendStatus(StatusCodes.SERVICE_UNAVAILABLE)
    }
  },

  async orderShopifyCreated(req, res) {
    // TODO if there is an in-progress order in DB, return 500
    // TODO if there is completed order in DB, return 200
    try {
      // const all_line_items = req.body.line_items
      const all_line_items = req.body.line_items
      let order_Teezily = {}
      let line_items_data =[]
      for (let line_items of all_line_items) {
        let url_frontdesign = '', style_id = '', color_id = '', prototype_id = '', size_id = ''

        for (let i = 0; i < line_items.properties.length; i++) {
          line_items.properties[i].name === '_customily-production-url' ? url_frontdesign = line_items.properties[i].value : ''
          line_items.properties[i].name === 'style_id' ? style_id = line_items.properties[i].value : ''
          line_items.properties[i].name === 'color_id' ? color_id = line_items.properties[i].value : ''
          line_items.properties[i].name === 'prototype_id' ? prototype_id = line_items.properties[i].value : ''
          line_items.properties[i].name === 'size_id' ? size_id = line_items.properties[i].value : ''
        }
        if (style_id !== '' && color_id !== '' && prototype_id !== '' && size_id !== '') {
          line_items_data.push({
            text_personalisations: [ { value: line_items.id } ],
            prototype_id, color_id, size_id, style_id, quantity: line_items.quantity, product: {
              name: line_items.name, style_id, front_design: {
                remote_picture_url: url_frontdesign, position_x: 0, position_y: 0, width: 100, height: 100
              }
            }
          })
        }
      }

      const customer = req.body.customer
      const billing_address = req.body.billing_address
      const shipping_address = req.body.shipping_address
      order_Teezily = formatRequestTeezily(line_items_data, customer, billing_address, shipping_address, req.body.name)

      let OrderDb= []
      // eslint-disable-next-line no-empty

      if (order_Teezily.line_items?.length > 0) {
        OrderDb = await OrderTeezilyModel.find({
          shopify_order_id: req.body.id, status: 'done'
        }).lean()
        if (OrderDb.length > 0) {
          res.sendStatus(StatusCodes.OK)
        } else {
          // TODO store in-progress order into DB
          const store_order = await OrderTeezilyModel.create({
            shopify_order_id: req.body.id, status: 'processing', teezily_order_id: '', order_status: 'unfullfiled'
          })
          const url = process.env.POST_ORDER_URL
          console.log(JSON.stringify(order_Teezily))
          const response = await fetch(url, {
            method: 'POST', body: JSON.stringify(order_Teezily), headers: {
              'Content-Type': 'application/json', Authorization: process.env.TEEZILY_TOKEN
            }
          })
          console.log(response)
          if (response.ok) {
            const data = await response.json()
            const teezilyOrderNumber = data.orders[0].order_number
            console.log('response', data)
            const updateOrder = await OrderTeezilyModel.findOneAndUpdate({ shopify_order_id: req.body.id }, {
              shopify_order_id: req.body.id,
              status: 'done',
              teezily_order_id: teezilyOrderNumber,
              order_status: 'unfullfiled'
            })
            console.log('updateOrder', updateOrder)
          } else {
            console.log(response.status)
            let tag = {}
            response.status === 500 ? tag = { 'order': { 'tags': 'errors', 'note' : 'Customily could not generate image' } } :
              response.status === 400 ? tag = { 'order': { 'tags': 'errors', 'note' : 'Wrong MetaField' } } : ''
            const url_err = 'https://dietollemode.myshopify.com/admin/api/2022-04/orders/'+req.body.id+'.json'
            const send_rr = await fetch(url_err, {
              method: 'PUT', body: JSON.stringify(tag), headers: { 'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN, 'Content-Type': 'application/json' }
            })
            console.log('send_rr', send_rr)
            const deleteOrder = await OrderTeezilyModel.deleteOne({ shopify_order_id: req.body.id })
            console.log('deleteOrder', deleteOrder)
            // eslint-disable-next-line no-unreachable
            res.sendStatus(StatusCodes.OK)

          }
        }
      }else {
        // eslint-disable-next-line no-unreachable
        res.sendStatus(StatusCodes.OK)
      }
      // TODO if ok, update the in-progress order to completed
      // TODO if ng, delete order
      // res.sendStatus(StatusCodes.OK)
    } catch (error) {
      //res.sendStatus(StatusCodes.SERVICE_UNAVAILABLE)
    }
  },

  async orderShopifyUpdated(req, res) {
    try {
      const orderShopify = new OrderShopify({ __store: req.__store })
      await orderShopify.updateOrders2Db([ req.body ])
      res.sendStatus(StatusCodes.OK)
    } catch (error) {

      console.error('orderShopifyUpdated: ', error)
      res.sendStatus(StatusCodes.SERVICE_UNAVAILABLE)
    }
  },

  async customerShopifyCreated(req, res) {
    try {
      const customerShopify = new CustomerShopify({ __store: req.__store })
      await customerShopify.updateCustomers2Db([ req.body ])

      res.sendStatus(StatusCodes.OK)
    } catch (error) {
      console.error('customerShopifyCreated: ', error)
      res.sendStatus(StatusCodes.SERVICE_UNAVAILABLE)
    }
  },

  async customerShopifyUpdated(req, res) {
    try {
      const customerShopify = new CustomerShopify({ __store: req.__store })
      await customerShopify.updateCustomers2Db([ req.body ])

      // res.sendStatus(StatusCodes.OK)
    } catch (error) {
      console.error('customerShopifyUpdated: ', error)
      // res.sendStatus(StatusCodes.SERVICE_UNAVAILABLE)
    }
  },

  async customerShopifyDeleted(req, res) {
    try {
      const customerShopify = new CustomerShopify({ __store: req.__store })
      await customerShopify.CustomerShopifyModel.findOneAndDelete({
        id: req.body.id,
      })
        .lean()
        .exec()

      res.sendStatus(StatusCodes.OK)
    } catch (error) {
      console.error('customerShopifyDeleted: ', error)
      res.sendStatus(StatusCodes.SERVICE_UNAVAILABLE)
    }
  },
}
