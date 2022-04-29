import React, { useCallback } from 'react'
import { withRouter } from 'react-router-dom'
import {
  Frame,
  TopBar,
} from '@shopify/polaris'

import {
  LOGO_HURA_URL,
} from '../../services/constant'

const Header = ({ children }) => {
  const handleNavigationToggle = useCallback(() => {
    console.log('toggle navigation visibility')
  }, [])

  const userMenuMarkup = (
    <TopBar.UserMenu
      name="2B Hura"
      detail="Shopify Experts"
      initials="2B"
      avatar={LOGO_HURA_URL}
      open={false}
      onToggle={() => {
        // eslint-disable-next-line no-undef
        if (window) window.open('https://experts.shopify.com/hura', '_blank')
      }}
    />
  )

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      userMenu={userMenuMarkup}
      onNavigationToggle={handleNavigationToggle}
    />
  )

  return (
    <Frame topBar={topBarMarkup}>
      { children }
    </Frame>
  )
}

export default withRouter(Header)
