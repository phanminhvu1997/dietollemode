// Model Customer Shopify
import mongoose from '../services/mongoose'

import { STORE_NAME } from '../services/constant'

const schema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
    },
    accepts_marketing: Boolean,
    accepts_marketing_updated_at: Date,
    addresses: {},
    currency: String,
    created_at: Date,
    default_address: {},
    email: {
      type: String,
      index: true,
    },
    first_name: String,
    last_name: String,
    last_order_id: Number,
    last_order_name: String,
    marketing_opt_in_level: String,
    multipass_identifier: String,
    note: String,
    orders_count: Number,
    phone: String,
    state: String,
    tags: String,
    tax_exempt: Boolean,
    tax_exemptions: {},
    total_spent: String,
    updated_at: Date,
    verified_email: Boolean,

    // CUSTOM PROPERTIES
    storeName: {
      type: String,
      default: STORE_NAME,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('CustomerShopify', schema)
