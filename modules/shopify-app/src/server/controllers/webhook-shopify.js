import { StatusCodes } from 'http-status-codes'

import * as config from '../services/constant'
import ProductShopify from '../infastructure/shopify/ProductShopify'
import OrderShopify from '../infastructure/shopify/OrderShopify'
import StoreModel from '../models/store'
import OrderTeezilyModel from '../models/TeezilyOrder'
import CustomerShopify from '../infastructure/shopify/CustomerShopify'

import fetch from 'node-fetch'

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

      const webhooks = [
        { topic: 'orders/create', address: '/orders/created' },
        { topic: 'orders/updated', address: '/orders/updated' },
        { topic: 'products/create', address: '/products/created' },
        { topic: 'products/update', address: '/products/updated' },
        { topic: 'products/delete', address: '/products/deleted' },
        { topic: 'customers/create', address: '/customers/created' },
        { topic: 'customers/update', address: '/customers/updated' },
        { topic: 'customers/delete', address: '/customers/deleted' },

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
          address,
          // @ts-ignore
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
    // console.log('orderShopifyCreated')
    //
    // return res.sendStatus(200)


    const OrderDb = await OrderTeezilyModel.find().lean()

    const checkDb = OrderDb.filter( order => order.shopify_order_id === req.body.id && order.status === 'done')
    console.log(checkDb)
    if (checkDb.length > 0 ) {
      res.sendStatus(StatusCodes.OK)
      return ''
    } else {
      res.sendStatus(StatusCodes.BAD_GATEWAY)
    }
    // TODO if there is an in-progress order in DB, return 500
    // TODO if there is completed order in DB, return 200

    try {

      const line_items = req.body.line_items[0]

      let url_frontdesign = ''
      let style_id = ''
      let color_id = ''
      let prototype_id = ''
      let size_id = ''

      for (let i = 0; i < line_items.properties.length; i++) {
        if (line_items.properties[i].name === '_customily-production-url') {
          url_frontdesign = line_items.properties[i].value
        }
        if (line_items.properties[i].name === 'style_id') {
          style_id = line_items.properties[i].value
        }
        if (line_items.properties[i].name === 'color_id') {
          color_id = line_items.properties[i].value
        }
        if (line_items.properties[i].name === 'prototype_id') {
          prototype_id = line_items.properties[i].value
        }
        if (line_items.properties[i].name === 'size_id') {
          size_id = line_items.properties[i].value
        }
      }
      if (   style_id !== '' &&
        color_id !== '' &&
        prototype_id !== '' &&
        size_id !== ''
      ) {

        const customer = req.body.customer
        const billing_address = req.body.billing_address
        const shipping_address = req.body.shipping_address
        const order_Teezily = {
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
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
          line_items: [ {
            prototype_id,
            color_id,
            size_id,
            style_id,
            quantity: line_items.quantity,
            product: {
              name: line_items.name,
              style_id,
              front_design: {
                remote_picture_url: url_frontdesign,
                position_x: 0,
                position_y: 0,
                width: 100,
                height: 100
              }
            }
          } ]
        }
        const url = process.env.POST_ORDER_URL

        console.log('xxx')
        // const dummy = ' {"email":"phanminhvu19222222297@gmail.com","first_name":"phan V","last_name":"t","shipping_address":{"address":"Buxtehude","zipcode":"21614","city":"Buxtehude","province_code":null,"country_code":"DE","first_name":"test t","last_name":"test"},"billing_address":{"address":"Buxtehude","zipcode":"21614","city":"Buxtehude","province_code":null,"country_code":"DE","first_name":"test t","last_name":"test"},"line_items":[{"prototype_id":"12","color_id":"13","size_id":"1","style_id":"1","quantity":1,"product":{"name":"Omasaurus, Mamasaurus - Personalisierte Kleidung, Geschenke für Oma, Mama - 0009A010A - T-Shirt / Weißes T-Shirt / S","style_id":"1","front_design":{"remote_picture_url":"https://cdn.customily.com/ExportFile/vanminhle881993/f31f565f-7ed3-4eab-9305-44c280387767.png","position_x":0,"position_y":0,"width":100,"height":100}}}]}'
        // const dummy_order = { 'email': 'phanminhvu19222222297@gmail.com', 'first_name': 'phan V', 'last_name': 't', 'shipping_address': { 'address': 'Buxtehude', 'zipcode': '21614', 'city': 'Buxtehude', 'province_code': null, 'country_code': 'DE', 'first_name': 'test t', 'last_name': 'test' }, 'billing_address': { 'address': 'Buxtehude', 'zipcode': '21614', 'city': 'Buxtehude', 'province_code': null, 'country_code': 'DE', 'first_name': 'test t', 'last_name': 'test' }, 'line_items': [ { 'prototype_id': '12', 'color_id': '13', 'size_id': '1', 'style_id': '1', 'quantity': 1, 'product': { 'name': 'Omasaurus, Mamasaurus - Personalisierte Kleidung, Geschenke für Oma, Mama - 0009A010A - T-Shirt / Weißes T-Shirt / S', 'style_id': '1', 'front_design': { 'remote_picture_url': 'https://cdn.customily.com/ExportFile/vanminhle881993/f31f565f-7ed3-4eab-9305-44c280387767.png', 'position_x': 0, 'position_y': 0, 'width': 100, 'height': 100 } } } ] }
        // TODO store in-progress order into DB
        const store_order =  await OrderTeezilyModel.create({
          shopify_order_id: req.body.id,
          status: 'processing'
        })

        // console.log('order_Teezily', JSON.stringify(order_Teezily))
        console.log('store_order', store_order)

        const response = await fetch( url, {
          method: 'POST',
          // body: JSON.stringify(order_Teezily),
          body: JSON.stringify(order_Teezily),
          headers: {
            'Content-Type': 'application/json',
            Authorization: process.env.TEEZILY_TOKEN }
        })

        console.log('response', response.status)
        if (response.status === 201) {
          const updateOrder = await OrderTeezilyModel.update({ shopify_order_id: req.body.id }, { shopify_order_id: req.body.id,
            status: 'done' })
          console.log('updateOrder', updateOrder)
        } else {
          const deleteOrder =await OrderTeezilyModel.deleteOne({ shopify_order_id: req.body.id } )
          console.log('deleteOrder', deleteOrder)
        }
        // TODO if ok, update the in-progress order to completed
        // TODO if ng, delete order

      }

      console.log('yyy')
      res.sendStatus(StatusCodes.OK)
    } catch (error) {
      console.error('orderShopifyCreated: ', error)
      res.sendStatus(StatusCodes.SERVICE_UNAVAILABLE)
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
