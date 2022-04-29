import React from 'react'

import { Redirect } from '@shopify/app-bridge/actions'
import { Context as AppBridgeContext } from '@shopify/app-bridge-react'
import { authenticatedFetch } from '@shopify/app-bridge-utils'

class Authenticator extends React.Component {
  static contextType = AppBridgeContext;

  constructor(...args) {
    super(...args)

    this.state = {
      authenticating: true,
      authenticated: false,
    }
  }

  async componentDidMount() {
    const fetch = authenticatedFetch(this.context)

    // get store by jwt
    const res = await fetch(`${this.props.apiHost}/shopify-app/my-store`)

    if (!res.ok) {
      const { oauthPath } = this.props

      return Redirect.create(this.context).dispatch(
        Redirect.Action.ADMIN_PATH,
        oauthPath
      )
    }

    const store = await res.json()

    this.setState({
      authenticating: false,
      authenticated: true,
      store,
    })
  }

  render() {
    const { authenticating, authenticated, store } = this.state

    if (authenticating) {
      return null
    }

    const { onAuthenticated } = this.props

    return authenticated ? onAuthenticated({ store }) : null
  }
}

export default Authenticator
