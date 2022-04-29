import moment from 'moment'

import AppModel from '../infastructure/AppModel'
import SubscriptionRecharge from '../infastructure/recharge/SubscriptionRecharge'
import * as config from '../services/constant'
import {
  createKey,
} from '../helpers/general'


const generateThemePrivateKey = async ({
  __store,
}) => {
  const base = new AppModel({ __store })
  const themePrivateKey = createKey({
    privateKey: __store.name,
  })
  const themes = await base.shopifyClient.theme.list({})
  const main = themes.find(theme => theme.role === 'main')
  await base.shopifyClient.asset.update(main.id, {
    key: 'snippets/app-private-key.liquid',
    value: themePrivateKey,
  })
  await base.StoreModel.findOneAndUpdate({
    name: __store.name,
  }, {
    themePrivateKey,
  }, {
    new: true,
  })
    .lean().exec()
}

export {
  generateThemePrivateKey,
}
