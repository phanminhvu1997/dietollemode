import jwt from 'jsonwebtoken'
import { URL } from 'url'
import util from 'util'
import { StatusCodes } from 'http-status-codes'

import storeLogic from '../logic/store'
import getApiClient from '../services/shopify-api'
import verifyDev from './verify-dev'

const verifyJWT = util.promisify(jwt.verify)

async function apiAuthentication(req, res, next) {
  try {
    const authorization = req.get('Authorization')
    const jwt = authorization.split(' ')[1]
    const options = process.env.NODE_ENV === 'development'
      ? {
        ignoreNotBefore: true,
        ignoreExpiration: true,
      } : {}
    const decoded = await verifyJWT(jwt, process.env.SHOPIFY_API_SECRET, options)

    // extract info from decoded
    const {
      iss: issuer,
      dest: destination,
      aud: apiKey,
      // time
      iat: issuedAt,
      nbf: notBefore,
      exp: expiration,
    } = decoded

    const nowInSeconds = Date.now() / 1000

    // verify time
    if (nowInSeconds <= notBefore || nowInSeconds >= expiration) {
      if (process.env.NODE_ENV !== 'development') {
        throw 'Invalid JWT'
      }
    }

    // verify apikey
    if (process.env.SHOPIFY_API_KEY !== apiKey) {
      throw 'Invalid JWT'
    }

    // verify hostname
    const { hostname: issuerHostname } = new URL(issuer)

    const { hostname: destinationHostname } = new URL(destination)

    if (issuerHostname !== destinationHostname) {
      throw 'Invalid JWT'
    }

    const storeName = issuerHostname

    // find store in db
    const store = await storeLogic.findByStoreName(storeName)

    if (!store) {
      // try re-install
      throw 'Store Not Found'
    }

    // verify access_token
    const apiClient = getApiClient(store.name, store.accessToken)
    const storeMetafields = await apiClient.metafield.list()

    if (!storeMetafields) {
      // bad access token, try to install
      throw 'Bad Access Token'
    }

    req.__store = store
    next()
  } catch (e) {
    console.error(e)

    // cannot use the JWT
    req._authenticationError = e
    res.sendStatus(StatusCodes.UNAUTHORIZED)
  }
}

export default verifyDev(apiAuthentication)
