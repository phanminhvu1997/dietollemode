import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Footer from '../layout/footer'
import Header from '../layout/header'

import HomePage from '../pages/home'

const MainRoutes = () => {
  return (
    <Router>
      <Header>
        <Switch>
          <Route path="/" component={(props) => <HomePage {...props} />} exact />
        </Switch>
        <Footer />
      </Header>
    </Router>
  )
}

export default MainRoutes
