// Model Product Shopify
import mongoose from '../services/mongoose'

import { STORE_NAME } from '../services/constant'

const schema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
    },
    title: String,
    handle: String,
    images: [],
    body_html: String,
    vendor: String,
    product_type: String,
    created_at: Date,
    updated_at: Date,
    published_at: Date,
    template_suffix: String,
    published_scope: String,
    tags: String,
    admin_graphql_api_id: String,
    options: {},
    image: {},
    variants: {},
    status: String,

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
export default mongoose.model('ProductShopify', schema)
