import AppModel from '../AppModel'

import {
  SHOPIFY_RESOURCE_LIMIT,
} from '../../services/constant'

class OrderShopify extends AppModel {
  constructor({ __store }) {
    super({ __store })
  }

  async updateOrders2Db(orders) {
    if (!orders.length) return
    return await this.OrderTeezilyModel.bulkWrite(
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

  async getOrderFromDb(id) {
    let result = await this.OrderShopifyModel.findOne({ id })
      .lean()
      .exec()

    return result
  }
}

export default OrderShopify
