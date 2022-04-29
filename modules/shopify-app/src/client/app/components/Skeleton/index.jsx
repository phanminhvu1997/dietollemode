import React from 'react'
import Loadable from 'react-loadable'

import { Provider } from '@shopify/app-bridge-react'
import Authenticator from '../Authenticator'

const App = Loadable({
  loader: () => import('../../app'),
  loading: () => <p>Authenticating...</p>
})

const Skeleton = ({ apiKey, apiHost, oauthPath, storeName, hostBase64 }) => {
  const config = {
    apiKey,
    host: hostBase64,
    forceRedirect: true
  }

  return (
    <Provider config={config}>
      <Authenticator
        apiHost={apiHost}
        oauthPath={oauthPath}
        onAuthenticated={({ store }) => <App store={store} />}
      />
    </Provider>
  )
}

export default Skeleton
