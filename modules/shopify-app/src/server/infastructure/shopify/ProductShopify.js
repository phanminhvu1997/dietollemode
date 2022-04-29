import AppModel from '../AppModel'

import {
  SHOPIFY_RESOURCE_LIMIT,
} from '../../services/constant'

class ProductShopify extends AppModel {
  constructor({ __store }) {
    super({ __store })
  }

  async updateProducts2Db(products) {
    if (!products.length) return

    await this.ProductShopifyModel.bulkWrite(
      products.map((product) => ({
        updateOne: {
          filter: { id: product.id },
          update: product,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      }))
    )

    return
  }

  async getProductsFromShopify(params) {
    return await this.shopifyClient.product.list({
      limit: SHOPIFY_RESOURCE_LIMIT,
      ...params,
    })
  }
}

export default ProductShopify
