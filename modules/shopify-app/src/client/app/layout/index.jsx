import React from 'react'
import Container from '../components/Container'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const LayoutMain = styled.div`
  margin-bottom: 30px;
`
const LayoutTitle = styled.h2`
  max-width: 1600px;
  margin: auto;
  padding: 40px 5px 30px;
  font-size: 26px;
  line-height: 30px;
  font-family: system-ui, Arial;
`
const LayoutContent = styled.div`
  width: calc(100% - 432px);
  padding: 16px;
  background: #fff;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px;
  border-radius: 2px;
  margin-right: 30px;
`
const LayoutSidebar = styled.div`
  max-width: 400px;
  width: 400px;
  padding: 16px;
  background: #fff;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px;
  border-radius: 2px;
`

const Layout = ({ children, title, minHeight, noSide, sidebar }) => {
  return (
    <LayoutMain>
      <LayoutTitle>{title || 'Layout title'}</LayoutTitle>
      <Container style={{ minHeight: minHeight && minHeight }}>
        <LayoutContent>{children}</LayoutContent>
        {noSide ? <div /> : <LayoutSidebar>{sidebar}</LayoutSidebar>}
      </Container>
    </LayoutMain>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  minHeight: PropTypes.string,
  noSide: PropTypes.bool,
  sidebar: PropTypes.node
}

export default Layout
