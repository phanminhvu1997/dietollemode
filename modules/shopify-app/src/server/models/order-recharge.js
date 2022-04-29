// Model Order Recharge
import mongoose from '../services/mongoose'

import {
  STORE_NAME,
} from '../services/constant'

const schema = new mongoose.Schema(
  {
    address_id: Number,
    address_is_active: Number,
    billing_address: {},
    browser_ip: String,
    charge_id: Number,
    charge_status: String,
    created_at: String,
    currency: String,
    customer: {},
    customer_id: Number,
    discount_codes: {},
    email: String,
    error: String,
    first_name: String,
    hash: String,
    id: {
      type: Number,
      unique: true,
    },
    is_prepaid: Number,
    last_name: String,
    line_items: {},
    note: String,
    note_attributes: {},
    payment_processor: String,
    processed_at: String,
    scheduled_at: String,
    shipped_date: String,
    shipping_address: {},
    shipping_date: String,
    shipping_lines: {},
    shopify_cart_token: String,
    shopify_customer_id: Number,
    shopify_id: Number,
    shopify_order_id: Number,
    shopify_order_number: String,
    status: String,
    subtotal_price: String,
    tags: String,
    tax_lines: {},
    total_discounts: String,
    total_line_items_price: String,
    total_price: String,
    total_refunds: String,
    total_tax: String,
    total_weight: String,
    transaction_id: String,
    type: String,
    updated_at: String,

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

export default mongoose.model('OrderRecharge', schema)
