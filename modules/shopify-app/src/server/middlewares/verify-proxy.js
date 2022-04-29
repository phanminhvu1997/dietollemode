import crypto from 'crypto'
import { StatusCodes } from 'http-status-codes'
import verifyDev from './verify-dev'

const { FORBIDDEN } = StatusCodes

// https://shopify.dev/tutorials/display-data-on-an-online-store-with-an-application-proxy-app-extension

const parametersEncoded = [ 'shop', 'path_prefix', 'timestamp' ]

const validateSignature = (query) => {
  if (
    !query ||
    !('shop' in query) ||
    !('path_prefix' in query) ||
    !('timestamp' in query) ||
    !('signature' in query)
  )
    return false

  const parameters = []
  for (const key in query) {
    if (parametersEncoded.includes(key)) {
      parameters.push(key + '=' + query[key])
    }
  }

  const message = parameters.sort().join('')
  const digest = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
    .update(message)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(query.signature)
  )
}

async function verifyStorefrontProxy(req, res, next) {
  try {
    const isValidated = validateSignature(req.query)

    if ('development' === process.env.NODE_ENV || isValidated) {
      next()
      return
    }

    res.sendStatus(FORBIDDEN)
  } catch (e) {
    console.error(e)
    res.sendStatus(FORBIDDEN)
  }
}

export default verifyDev(verifyStorefrontProxy)
