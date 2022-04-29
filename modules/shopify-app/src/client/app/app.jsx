import React from 'react'
import { AppProvider } from '@shopify/polaris'
// @ts-ignore
import enTranslations from '@shopify/polaris/locales/en.json'
import MainRoutes from './routes'
import '@shopify/polaris/dist/styles.css'
import './style.css'
import 'antd/dist/antd.css'
import {
  LOGO_2B_URL
} from './services/constant'

const theme = {
  colors: {
    surface: '#111213',
    onSurface: '#111213',
    interactive: '#2e72d2',
    secondary: '#111213',
    primary: '#3b5998',
    critical: '#d82c0d',
    warning: '#ffc453',
    highlight: '#5bcdda',
    success: '#008060',
    decorative: '#ffc96b',
  },
  colorScheme: 'light',
  logo: {
    width: 44,
    topBarSource: LOGO_2B_URL,
    accessibilityLabel: '2B Hura - Shopify Experts',
  },
}

const App = () => {
  return (
    <AppProvider
      i18n={enTranslations}
      theme={theme}
    >
      <MainRoutes />
    </AppProvider>
  )
}

export default App
