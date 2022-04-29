import { StatusCodes } from 'http-status-codes'

import * as config from '../services/constant'
import getRechargeClient from '../services/recharge'
import SubscriptionRecharge from '../infastructure/recharge/SubscriptionRecharge'
import OrderRecharge from '../infastructure/recharge/OrderRecharge'

export default {
  async registerWhRecharge(req, res) {
    try {
      const host = config.HOST

      const rechargeClient = await getRechargeClient()
      const webhooks = [
        { topic: 'subscription/created', address: '/subscription/created' },
        { topic: 'subscription/updated', address: '/subscription/updated' },
        { topic: 'subscription/deleted', address: '/subscription/deleted' },
        /**
         * Recharge Shopify checkout
         * Only webhook order/created working
         */
        { topic: 'order/created', address: '/order/created' },
        { topic: 'order/updated', address: '/order/updated' },
      ]
      const registedWebhooks = await rechargeClient.webhook.list()

      for (const { id } of registedWebhooks) {
        await rechargeClient.webhook.delete(id)
      }

      const result = []
      for (const webhook of webhooks) {
        const address = `${host}/wh-recharge${webhook.address}`
        const topic = webhook.topic
        const res = await rechargeClient.webhook.create({
          address,
          topic,
        })
        result.push(res)
      }
      res.json(result)
    } catch (error) {
      console.error('registerWhRecharge: ', error)
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
    }
  },

  async removeWhRecharge(req, res) {
    try {
      const rechargeClient = await getRechargeClient()

      const registedWebhooks = await rechargeClient.webhook.list()

      for (const { id } of registedWebhooks) {
        await rechargeClient.webhook.delete(id)
      }

      res.json({})
    } catch (error) {
      console.error('removeWhRecharge: ', error)
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
    }
  },

  async subscriptionRechargeCreated(req, res) {
    try {
      const { subscription } = req.body
      const subscriptionRecharge = new SubscriptionRecharge({
        __store: req.__store,
      })

      await subscriptionRecharge.updateSubscriptions2Db([ subscription ])
      res.sendStatus(StatusCodes.OK)
    } catch (error) {
      console.error('subscriptionRechargeCreated: ', error)
      res.sendStatus(StatusCodes.SERVICE_UNAVAILABLE)
    }
  },

  async subscriptionRechargeUpdated(req, res) {
    try {
      const { subscription } = req.body
      const subscriptionRecharge = new SubscriptionRecharge({
        __store: req.__store,
      })
      await subscriptionRecharge.updateSubscriptions2Db([ subscription ])

      res.sendStatus(StatusCodes.OK)
    } catch (error) {
      console.error('subscriptionRechargeUpdated: ', error)
      res.sendStatus(StatusCodes.SERVICE_UNAVAILABLE)
    }
  },

  async subscriptionRechargeDeleted(req, res) {
    try {
      const { subscription } = req.body
      const subscriptionRecharge = new SubscriptionRecharge({
        __store: req.__store,
      })
      await subscriptionRecharge.SubscriptionModel.findOneAndDelete({ id: subscription.id })
        .lean()
        .exec()

      res.sendStatus(StatusCodes.OK)
    } catch (error) {
      console.error('subscriptionRechargeDeleted: ', error)
      res.sendStatus(StatusCodes.SERVICE_UNAVAILABLE)
    }
  },

  async orderRechargeCreated(req, res) {
    try {
      const { order } = req.body
      const orderRecharge = new OrderRecharge({
        __store: req.__store,
      })
      await orderRecharge.updateOrders2Db([ order ])

      res.sendStatus(StatusCodes.OK)
    } catch (error) {
      console.error('orderRechargeCreated: ', error)
      res.sendStatus(StatusCodes.SERVICE_UNAVAILABLE)
    }
  },

  async orderRechargeUpdated(req, res) {
    try {
      const { order } = req.body
      const orderRecharge = new OrderRecharge({
        __store: req.__store,
      })
      await orderRecharge.updateOrders2Db([ order ])

      res.sendStatus(StatusCodes.OK)
    } catch (error) {
      console.error('orderRechargeUpdated: ', error)
      res.sendStatus(StatusCodes.SERVICE_UNAVAILABLE)
    }
  },
}
