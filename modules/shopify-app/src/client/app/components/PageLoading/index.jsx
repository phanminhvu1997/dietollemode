import React from 'react'
import {
  Layout,
  Card,
  SkeletonDisplayText,
  SkeletonBodyText,
  TextContainer,
  Loading,
} from '@shopify/polaris'

const PageLoading = () => {

  return (
    <Layout>
      <Loading />
      <Layout.Section>
        <Card sectioned>
          <SkeletonBodyText />
        </Card>
        <Card sectioned>
          <TextContainer>
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText />
          </TextContainer>
        </Card>
        <Card sectioned>
          <TextContainer>
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText />
          </TextContainer>
        </Card>
      </Layout.Section>
    </Layout>
  )
}

export default PageLoading
