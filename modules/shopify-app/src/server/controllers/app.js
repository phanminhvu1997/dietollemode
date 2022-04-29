import createSafeController from './safe-controller'

export default createSafeController({
  render(req, res) {
    res.render('app', {
      host: `https://${req.hostname}`,
      store: req.query.shop || '',
      hostBase64: req.query.host || '',
      shopifyApiKey: process.env.SHOPIFY_API_KEY,
    })
  },
})
