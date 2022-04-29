import Recharge from 'recharge-api-node'
import { RECHARGE_SECRET, RECHARGE_TOKEN } from './constant'

const memoryStore = {}

function createRechargeApiClient(apiKey, autoLimit = true) {
  const recharge = new Recharge({
    apiKey,
    secrete: RECHARGE_SECRET,
    autoLimit,
  })

  return recharge
}

function getRechargeClient(key = RECHARGE_TOKEN) {
  // look in memory store
  const client = memoryStore[key]

  return client || (memoryStore[key] = createRechargeApiClient(key))
}

export default getRechargeClient
