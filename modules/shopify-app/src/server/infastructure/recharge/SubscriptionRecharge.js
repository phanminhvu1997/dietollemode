import AppModel from '../AppModel'

import {
  RECHARGE_RESOURCE_LIMIT,
} from '../../services/constant'

class SubscriptionRecharge extends AppModel {
  constructor({ __store }) {
    super({ __store })
  }

  async updateSubscriptions2Db(subscriptions) {
    if (!subscriptions.length) return
    return await this.SubscriptionModel.bulkWrite(
      subscriptions.map((subscription) => ({
        updateOne: {
          filter: { id: subscription.id },
          update: subscription,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      }))
    )
  }

  async getSubscriptionsFromRecharge(params) {
    return await this.rechargeClient.subscription.list({
      limit: RECHARGE_RESOURCE_LIMIT,
      ...params,
    })
  }

  async getSubscriptionFromDbOrRecharge(id) {
    let result = await this.SubscriptionModel.findOne({
      id,
    })
      .lean()
      .exec()
    if (result) return result

    try {
      result = await this.rechargeClient.subscription.get(id)
    } catch (error) {
      // return
    }
    if (result) {
      this.updateSubscriptions2Db([ result ])
        .then(r => r)
        .catch(e => { throw e })
    }
    return result
  }
}

export default SubscriptionRecharge
