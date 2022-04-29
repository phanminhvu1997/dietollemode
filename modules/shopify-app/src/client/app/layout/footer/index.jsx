import React from 'react'
import {
  FooterHelp,
  Link,
} from '@shopify/polaris'

const Footer = () => {
  return (
    <>
      <br />
      <FooterHelp>
        For help with app, contact our { ' ' } <Link url="mailto:experts@2-b.io" external>Support team</Link>
      </FooterHelp>
    </>
  )
}

export default Footer
