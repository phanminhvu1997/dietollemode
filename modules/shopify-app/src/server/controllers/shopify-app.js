import { v4 as uuidV4 } from 'uuid'

import createSafeController from './safe-controller'
import AppModel from '../infastructure/AppModel'
import {

} from '../logic/shopify-app'

import {
  API_STATUS_ERROR,
  API_STATUS_SUCCESS,
  SUBSCRIPTION_STATUS_ACTIVE,
  NOTE_PET_BIRTHDAY,
  DAY_BY_UNIT,
} from '../services/constant'

export default createSafeController({
  async getRuleset(req, res, next) {
    try {
      const base = new AppModel({ __store: req.__store })
      let ruleset = await base.RulesetModel.findOne({
        storeName: req.__store.name,
      })
        .lean()
        .exec()
      if (!ruleset) {
        ruleset = await new base.RulesetModel({
          storeName: req.__store.name,
        }).save()
      }

      const products = await base.ProductShopifyModel.find({
        storeName: req.__store.name,
      })
        .lean()
        .exec()

      res.json({
        ruleset,
        products,
      })
    } catch (e) {
      console.error('getRulesets: ', e)
      next(e)
    }
  },

  async createRuleset(req, res, next) {
    try {
      res.json({})
    } catch (e) {
      console.error('createRuleset: ', e)
      next(e)
    }
  },

  async updateRuleset(req, res, next) {
    try {
      const base = new AppModel({ __store: req.__store })

      res.json({})
    } catch (e) {
      console.error('updateRuleset: ', e)
      next(e)
    }
  },

  async getProducts(req, res, next) {
    try {
      res.json({})
    } catch (e) {
      console.error('getProducts: ', e)
      next(e)
    }
  },

  async getPawpassMember(req, res, next) {
    try {
      const base = new AppModel({ __store: req.__store })

      const subcriptions = await base.SubscriptionModel.find({
        status: SUBSCRIPTION_STATUS_ACTIVE,
        next_charge_scheduled_at: { $ne: null },
      })
        .lean().exec()
      const orders = await base.OrderRechargeModel.find({
        'line_items.subscription_id': { $in: [ ...new Set(subcriptions.map(s => s.id)) ] },
      })
        .lean().exec()
      const customers = await base.CustomerShopifyModel.find({
        email: { $in: [ ...new Set(subcriptions.map(s => s.email)) ] },
      })
        .lean().exec()

      const result = customers.map(customer => {
        const {
          email,
          note = '',
          first_name,
          last_name,
          id,
        } = customer

        const subsByCustomer = subcriptions.filter(s => s.email === email)
        const totalDaysBySubs = subsByCustomer.map(sub => {
          const {
            id,
            order_interval_frequency,
            order_interval_unit,
          } = sub
          const ordersBySub = orders.filter(order => order.line_items.find(line => Number(line.subscription_id) === Number(id)))
          return ordersBySub.length * Number(order_interval_frequency) * DAY_BY_UNIT[order_interval_unit]
        })
        // console.log(subsByCustomer)
        const maxDays = Math.max(...totalDaysBySubs)
        const pawpassMonth = Math.floor(maxDays / 30)
        const petBirthStr = (note || '').split(/\n/).find(str => str.toLowerCase().includes('pet') && str.toLowerCase().includes('birthday')) || ''
        return {
          customerId: id,
          email,
          pawpassMonth: pawpassMonth === 0 ? 1 : pawpassMonth,
          petBirthStr: petBirthStr.replace(/[^0-9]/gi, '').trim(),
          firstName: first_name,
          lastName: last_name,
        }
      })

      res.json({
        status: API_STATUS_SUCCESS,
        data: {
          pawpass: result,
        },
      })
    } catch (error) {
      console.error('getPawpassMember: ', error)
      next(error)
    }
  },
})
