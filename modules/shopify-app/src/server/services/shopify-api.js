import Shopify from 'shopify-api-node'

const apiVersion = process.env.SHOPIFY_API_VERSION

const multiton = {}

function generateKey(storeName, accessToken) {
  return `${storeName}:${accessToken}`
}

function createShopifyApiClient(storeName, accessToken, autoLimit = true) {
  const client = new Shopify({
    shopName: storeName,
    accessToken,
    autoLimit,
    apiVersion,
  })

  client.on('callLimits', (limits) => console.log(storeName, limits))

  return client
}

/**
 *
 * @param {*} storeName
 * @param {*} accessToken
 * @returns {Shopify}
 */
function getApiClient(storeName, accessToken) {
  const key = generateKey(storeName, accessToken)

  // look in memory store
  const client = multiton[key]

  return (
    client || (multiton[key] = createShopifyApiClient(storeName, accessToken))
  )
}

export default getApiClient
