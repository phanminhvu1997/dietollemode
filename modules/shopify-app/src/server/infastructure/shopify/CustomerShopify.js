import AppModel from '../AppModel'

import { SHOPIFY_RESOURCE_LIMIT } from '../../services/constant'

class CustomerShopify extends AppModel {
  constructor({ __store }) {
    super({ __store })
  }

  async updateCustomers2Db(customers) {
    if (!customers.length) return

    await this.CustomerShopifyModel.bulkWrite(
      customers.map((customer) => ({
        updateOne: {
          filter: { id: customer.id },
          update: customer,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      }))
    )

    return
  }

  async getCustomersFromShopify(params) {
    return await this.shopifyClient.customer.list({
      limit: SHOPIFY_RESOURCE_LIMIT,
      ...params,
    })
  }

  async getCustomersHasCustomTag() {
    return await this.CustomerShopifyModel.find({
      custom_tags: { $exists: true, $nin: [ '', null ] },
    }).lean()
  }
}

export default CustomerShopify
