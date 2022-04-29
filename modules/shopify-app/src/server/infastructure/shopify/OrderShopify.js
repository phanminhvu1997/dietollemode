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
    return await this.OrderShopifyModel.bulkWrite(
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

  async getOrdersFromShopify(params) {
    return await this.shopifyClient.order.list({
      limit: SHOPIFY_RESOURCE_LIMIT,
      ...params,
    })
  }

  async getOrderFromDbOrShopify(id) {
    let result = await this.OrderShopifyModel.findOne({ id })
      .lean()
      .exec()

    if (result) return result
    try {
      result = await this.shopifyClient.order.get(id)
    } catch (error) {
      console.error(`getOrder shopify ${id}: `, error)
    }
    return result
  }
}

export default OrderShopify
