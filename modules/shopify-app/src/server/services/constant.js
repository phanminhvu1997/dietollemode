export const RECHARGE_TOKEN = process.env.RECHARGE_TOKEN
export const RECHARGE_SECRET = process.env.RECHARGE_SECRET
export const HOST = process.env.HOST
export const STORE_NAME = process.env.STORE_NAME

export const METAFIELDS_NAMESPACE = 'custom_app_hura'
export const METAFIELDS_KEY = {
  intervalFrequency: 'interval_frequency',
  intervalUnit: 'interval_unit',
}

export const METAFIELDS_VALUE_TYPE = {
  integer: 'integer',
  string: 'string',
  jsonString: 'json_string'
}

export const COLLECTIONS_RESOURCE = 'custom_collection'
export const VARIANT_RESOURCE = 'variant'
export const PRODUCT_RESOURCE = 'product'
export const CUSTOMER_RESOURCE = 'customer'
export const SHOP_RESOURCE = 'shop'
export const SHOPIFY_RESOURCE_LIMIT = 250
export const RECHARGE_RESOURCE_LIMIT = 250

export const SUFFIX_PRODUCT_TITLE = 'for subscription'
export const PRODUCT_TAGS = 'subscriptions_product'
export const HIDE_TAGS = 'hide'

export const RECHARGE_FORMAT_DAY = 'YYYY-MM-DD'

export const SUBSCRIPTION_STATUS_ACTIVE = 'ACTIVE'
export const SUBSCRIPTION_STATUS_CANCELLED = 'CANCELLED'
export const SUBSCRIPTION_STATUS_EXPIRED = 'EXPIRED'
export const ORDER_RECHARGE_CHECKOUT = 'CHECKOUT'
export const ORDER_RECHARGE_RECURRING = 'RECURRING'

export const API_STATUS_SUCCESS = 'success'
export const API_STATUS_ERROR = 'error'
export const DEFAULT_DB_LIMIT = 1000000
export const NOTE_PET_BIRTHDAY = 'Pet\'s Birthday'
export const DAY_BY_UNIT = {
  day: 1,
  week: 7,
  month: 30,
}
