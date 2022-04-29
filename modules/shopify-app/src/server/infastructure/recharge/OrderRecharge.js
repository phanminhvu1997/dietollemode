import AppModel from '../AppModel'

import {
  RECHARGE_RESOURCE_LIMIT,
} from '../../services/constant'

class OrderRecharge extends AppModel {
  constructor({ __store }) {
    super({ __store })
  }

  async updateOrders2Db(orders) {
    if (!orders.length) return
    return await this.OrderRechargeModel.bulkWrite(
      orders.map((order) => ({
        updateOne: {
          filter: { id: order.id },
          update: order,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      }))
    )
  }

  async getOrdersFromRecharge(params) {
    return await this.rechargeClient.order.list({
      limit: RECHARGE_RESOURCE_LIMIT,
      ...params,
    })
  }
}

export default OrderRecharge
