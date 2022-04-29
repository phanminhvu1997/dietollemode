import { get } from 'lodash'

import { API_STATUS_ERROR } from '../services/constant'

// run after verifyStorefrontProxy
const verifyThemePrivateKey = (req, res, next) => {
  try {
    if (
      get(req, 'headers.private-key') === req.__store.themePrivateKey
    ) {
      next()
      return
    }

    res.json({
      status: API_STATUS_ERROR,
      message: 'Unauthorized',
      data: {},
    })
    return
  } catch (error) {
    next(error)
  }
}

export default verifyThemePrivateKey
