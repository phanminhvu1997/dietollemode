// Model Recharge Subscription
import mongoose from '../services/mongoose'

import { STORE_NAME } from '../services/constant'

const schema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  address_id: Number,
  analytics_data: {},
  cancellation_reason: String,
  cancellation_reason_comments: String,
  cancelled_at: String,
  charge_interval_frequency: Number,
  created_at: String,
  customer_id: Number,
  email: {
    type: String,
    index: true,
  },
  expire_after_specific_number_of_charges: Number,
  has_queued_charges: Number,
  is_prepaid: {
    type: Boolean,
    index: true,
  },
  is_skippable: Boolean,
  is_swappable: Boolean,
  max_retries_reached: Number,
  next_charge_scheduled_at: String,
  order_day_of_month: Number,
  order_day_of_week: Number,
  order_interval_frequency: Number,
  order_interval_unit: String,
  price: String,
  product_title: String,
  properties: {},
  quantity: Number,
  recharge_product_id: Number,
  shopify_product_id: Number,
  shopify_variant_id: {
    type: Number,
    index: true,
  },
  sku: String,
  sku_override: Boolean,
  status: String,
  updated_at: String,
  variant_title: String,

  // CUSTOM FIELDS FOR SUBSCRIPTION
  storeName: {
    type: String,
    default: STORE_NAME,
  },

}, {
  timestamps: true
})

export default mongoose.model('Subscription', schema)
