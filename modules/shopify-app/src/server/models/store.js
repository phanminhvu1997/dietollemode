import mongoose from '../services/mongoose'

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  accessToken: {
    type: String,
    required: true
  },
  information: {
    type: Object
  },
  informationUpdatedAt: {
    type: Date
  },
  themePrivateKey: {
    type: String,
  },
}, {
  timestamps: true
})

schema.methods.toJSON = function() {
  var obj = this.toObject()

  // remove sensitive data
  delete obj.accessToken
  delete obj.information

  return obj
}

export default mongoose.model('Store', schema)
