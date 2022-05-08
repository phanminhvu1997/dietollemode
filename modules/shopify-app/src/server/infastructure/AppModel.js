import getRechargeClient from '../services/recharge'
import getApiClient from '../services/shopify-api'

import StoreModel from '../models/store'
import SubscriptionModel from '../models/subscription'
import ProductShopifyModel from '../models/product-shopify'
import OrderShopifyModel from '../models/order-shopify'
import RulesetModel from '../models/ruleset'
import OrderRechargeModel from '../models/order-recharge'
import CustomerShopifyModel from '../models/customer-shopify'
import OrderTeezilyModel from '../models/TeezilyOrder'

class AppModel {
  constructor({ __store }) {
    this.__store = __store
    this.rechargeClient = getRechargeClient()
    this.shopifyClient = getApiClient(__store.name, __store.accessToken)

    this.StoreModel = StoreModel
    this.SubscriptionModel = SubscriptionModel
    this.ProductShopifyModel = ProductShopifyModel
    this.OrderShopifyModel = OrderShopifyModel
    this.OrderTeezilyModel =OrderTeezilyModel
    this.OrderRechargeModel = OrderRechargeModel
    this.RulesetModel = RulesetModel
    this.CustomerShopifyModel = CustomerShopifyModel
  }
}

export default AppModel
