import ms from 'ms'
import Store from '../models/store'
import getApiClient from '../services/shopify-api'

const OUT_OF_DATED = '3d'

export async function findByStoreName(storeName) {
  const store = await Store.findOne({ name: storeName })

  return store
}

export async function setup({ storeName, accessToken }) {
  // check store existence
  const existence = await Store.findOne({ storeName })

  const store =
    (await Store.findOne({
      name: storeName,
    })) ||
    new Store({
      name: storeName,
      accessToken,
    })

  if (
    !store.informationUpdatedAt ||
    Date.now() - store.informationUpdatedAt > ms(OUT_OF_DATED)
  ) {
    const apiClient = getApiClient(storeName, accessToken)

    store.information = await apiClient.shop.get()
    store.informationUpdatedAt = Date.now()
  }

  if (store.accessToken !== accessToken) {
    store.accessToken = accessToken
  }

  if (store.isNew || store.isModified()) {
    await store.save()
  }

  return store
}

const storeLogic = {
  findByStoreName,
  setup,
}

export default storeLogic
