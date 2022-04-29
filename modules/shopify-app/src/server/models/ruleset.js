import mongoose from '../services/mongoose'

import {
  STORE_NAME,
} from '../services/constant'

const schema = new mongoose.Schema({
  storeName: {
    type: String,
    default: STORE_NAME,
  },

}, {
  timestamps: true,
})

export default mongoose.model('Ruleset', schema)
