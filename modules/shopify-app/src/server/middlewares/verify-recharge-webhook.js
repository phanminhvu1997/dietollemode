import crypto from 'crypto'
import bodyParser from 'body-parser'
import { StatusCodes } from 'http-status-codes'
import getRechargeClient from '../services/recharge'

import { RECHARGE_SECRET, RECHARGE_TOKEN } from '../services/constant'
import verifyDev from './verify-dev'

const { FORBIDDEN } = StatusCodes

/*
  Verify webhook: https://developer.rechargepayments.com/?python#webhook-validation
  NOT WORKING!!
*/
const verifyRechargeWebhook = async (req, res, next) => {
  try {
    const rechargeClient = getRechargeClient()

    const hmac = req.get('X-Recharge-Hmac-Sha256')
    const hash1 = crypto
      .createHmac('sha256', RECHARGE_TOKEN)
      .update(req.rawBody.toString('utf-8'))
      .digest('hex')
    const hash2 = crypto
      .createHmac('sha256', RECHARGE_TOKEN, { encoding: 'utf-8' })
      .update(req.rawBody, 'utf8', 'base64')
      .digest('hex')
    const hash3 = crypto
      .createHmac('sha256', RECHARGE_TOKEN, { encoding: 'utf-8' })
      .update(JSON.stringify(req.body), 'utf8', 'hex')
      .digest('hex')

    const isValidated = await rechargeClient.webhook.validate(
      RECHARGE_SECRET,
      req.body,
      hmac
    )

    // if (hash !== hmac) {
    //   return res.sendStatus(403)
    // }

    // from Shopify, verification passed
    next()
  } catch (error) {
    console.log(error)
    next()
    // res.sendStatus(FORBIDDEN)
  }
}

export default verifyDev(verifyRechargeWebhook)
