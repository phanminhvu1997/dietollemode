import storeLogic from '../logic/store'
import fetch from '../services/fetch'

import createSafeController from './safe-controller'

export default createSafeController({
  async handleCallback(req, res, next) {
    // TODO using Joi to verify req.query
    const { shop: storeName, code } = req.query

    // exchange code for access token
    const response = await fetch(
      `https://${storeName}/admin/oauth/access_token`,
      {
        method: 'post',
        body: JSON.stringify({
          client_id: process.env.SHOPIFY_API_KEY,
          client_secret: process.env.SHOPIFY_API_SECRET,
          code,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return res.sendStatus(response.status)
    }

    const authResponse = await response.json()
    const { access_token: accessToken } = authResponse

    // initialize store information
    const store = await storeLogic.setup({
      storeName,
      accessToken,
    })

    res.redirect(
      `https://${store.name}/admin/apps/${process.env.SHOPIFY_API_KEY}`
    )
  },
})
