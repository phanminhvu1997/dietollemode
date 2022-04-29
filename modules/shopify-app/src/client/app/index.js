/* eslint-disable no-undef */
//@ts-nocheck

import React from 'react'
import { render } from 'react-dom'
import URI from 'urijs'

import Skeleton from './components/Skeleton'
const redirectUri = `${API_HOST}/oauth/callback`
const oauthPath = URI('/oauth/authorize')
  .addQuery('client_id', API_KEY)
  .addQuery('scope', 'read_customers,write_customers,read_products,write_products,read_orders,write_orders,read_themes,write_themes')
  .addQuery('redirect_uri', redirectUri)
  .toString()

if (window.top === window.self) {
  window.location.assign(`https://${STORE}/admin${oauthPath}`)
} else {
  const root = document.getElementById('app')

  render(
    <Skeleton
      apiKey={API_KEY}
      apiHost={API_HOST}
      hostBase64={HOST_BASE64}
      storeName={STORE}
      oauthPath={oauthPath}
    />,
    root
  )
}
