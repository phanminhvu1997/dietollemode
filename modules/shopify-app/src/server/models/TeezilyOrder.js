// Model Order Shopify
import mongoose from '../services/mongoose'

import {
  STORE_NAME,
} from '../services/constant'

const schema = new mongoose.Schema(
  {
    shopify_order_id: Number,
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

export default mongoose.model('OrderTeezily', schema)
