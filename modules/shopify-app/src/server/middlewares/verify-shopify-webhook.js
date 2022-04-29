import crypto from 'crypto'
import { StatusCodes } from 'http-status-codes'

import verifyDev from './verify-dev'

const { FORBIDDEN } = StatusCodes

/*
  Verify webhook: https://shopify.dev/tutorials/manage-webhooks#creating-an-endpoint-for-webhooks
  - Compute HMAC digest: req.body + SHA256
  - Compare with [X-Shopify-Hmac-Sha256] header
*/
const verifyShopifyWebhook = async (req, res, next) => {
  try {

    const hmac = req.get('X-Shopify-Hmac-Sha256')

    const digest = crypto
      .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
      .update(req.rawBody)
      .digest('base64')

    const verified = crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(hmac),
    )

    if (!verified) {
     // return res.sendStatus(FORBIDDEN)
    }

    next()
  } catch (error) {
    console.log(error)
    next()
  }
}

export default verifyDev(verifyShopifyWebhook)
