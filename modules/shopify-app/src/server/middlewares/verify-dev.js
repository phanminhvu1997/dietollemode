import { get } from 'lodash'
import storeLogic from '../logic/store'
import { STORE_NAME } from '../services/constant'

const verifyDev = (otherVerify) => async (req, res, next) => {
  const store = await storeLogic.findByStoreName(STORE_NAME)
  req.__store = store
  if (
    process.env.PASS_DEV &&
    get(req, 'headers.pass_dev') === process.env.PASS_DEV
  ) {
    return next()
  }
  otherVerify(req, res, next)
}

export default verifyDev
