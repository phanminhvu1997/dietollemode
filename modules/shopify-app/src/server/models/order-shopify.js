// Model Order Shopify
import mongoose from '../services/mongoose'

import {
  STORE_NAME,
} from '../services/constant'

const schema = new mongoose.Schema(
  {
    app_id: Number,
    billing_address: {},
    browser_ip: String,
    buyer_accepts_marketing: Boolean,
    cancel_reason: String,
    cancelled_at: Date,
    cart_token: String,
    checkout_token: String,
    client_details: {},
    closed_at: Date,
    created_at: Date,
    currency: String,
    current_total_discounts: String,
    current_total_discounts_set: {},
    current_total_duties_set: {},
    current_total_price: String,
    current_total_price_set: {},
    current_subtotal_price: String,
    current_subtotal_price_set: {},
    current_total_tax: String,
    current_total_tax_set: {},
    customer: {},
    customer_locale: String,
    discount_applications: {},
    discount_codes: {},
    email: String,
    financial_status: String,
    fulfillments: {},
    fulfillment_status: String,
    gateway: String,
    id: {
      type: Number,
      unique: true,
    },
    landing_site: String,
    line_items: {},
    location_id: Number,
    name: String,
    note: String,
    note_attributes: {},
    number: Number,
    order_number: Number,
    original_total_duties_set: {},
    payment_details: {},
    payment_gateway_names: {},
    phone: String,
    presentment_currency: String,
    processed_at: Date,
    processing_method: String,
    referring_site: String,
    refunds: {},
    shipping_address: {},
    shipping_lines: {},
    source_name: String,
    subtotal_price: Number,
    subtotal_price_set: {},
    tags: String,
    tax_lines: {},
    taxes_included: Boolean,
    token: String,
    total_discounts: String,
    total_discounts_set: {},
    total_line_items_price: String,
    total_line_items_price_set: {},
    total_outstanding: String,
    total_price: String,
    total_price_set: {},
    total_shipping_price_set: {},
    total_tax: String,
    total_tax_set: {},
    total_tip_received: String,
    total_weight: Number,
    updated_at: Date,
    user_id: Number,
    order_status_url: String,

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

export default mongoose.model('OrderShopify', schema)
