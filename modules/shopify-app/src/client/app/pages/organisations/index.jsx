/* eslint-disable no-undef */
import React, { useState, useEffect, useCallback } from 'react'
import { useAppBridge } from '@shopify/app-bridge-react'
import { authenticatedFetch } from '@shopify/app-bridge-utils'
import { ResourcePicker } from '@shopify/app-bridge-react'
import {
  Page,
  Badge,
  Card,
  TextField,
  Layout,
  Toast,
  Button,
  Stack,
  TextStyle,
  Thumbnail,
  PageActions,
  Loading,
  FormLayout,
  Tag,
  DropZone,
  Caption,
  TextContainer,
  Scrollable,
  List,
  Modal,
} from '@shopify/polaris'

import {
  DeleteMinor,
  NoteMinor,
} from '@shopify/polaris-icons'

import PageLoading from '../../components/PageLoading'
import ModalAddOrganisation from './ModalAddOrganisation'
import ListOrganisations from './ListOrganisations'
import ModalUpdateTags from './ModalUpdateTags'
import ModalConfirmDelete from './ModalConfirmDelete'

import {
  GRAPHQL_PRODUCT_ID,
  GRAPHQL_VARIANT_ID,
  API_STATUS_ERROR,
  API_STATUS_SUCCESS,
} from '../../services/constant'

import {
  handelize,
} from '../../services/helper'

const LOADING_DATA_ERROR = 'Something error!'
const DUPLICATED_TAG_ERROR = 'TAG IS DUPLICATED!'
const SYNTAX_TAG_ERROR = 'TAG CANNOT INCLUDE SPECIALS CHARACTERS!'

const config = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
}

const PageOrganisations = (props) => {
  const contextType = useAppBridge()

  const [ loading, setLoading ] = useState(false)
  const [ toastText, setToastText ] = useState('')
  const [ err, setErr ] = useState(false)
  const [ showToast, setShowToast ] = useState(false)

  const [ organisations, setOrganisations ] = useState([])

  const [ openModalCreate, setOpenModalCreate ] = useState(false)
  const [ loadingCreate, setLoadingCreate ] = useState(false)
  const [ organisationNameErrRes, setOrganisationNameErrRes ] = useState('')
  const [ tagErrRes, setTagErrRes ] = useState('')

  const [ indexOrganisation, setIndexOrganisation ] = useState(0)

  const [ openModalConfirmDelete, setOpenModalConfirmDelete ] = useState(false)
  const [ loadingConfirmDelete, setLoadingConfirmDelete ] = useState(false)

  const [ openModalUpdateTags, setOpenModalUpdateTags ] = useState(false)
  const [ loadingUpdateTags, setLoadingUpdateTags ] = useState(false)

  const toast = showToast ?
    <Toast
      error={err}
      content={toastText}
      duration={3000}
      onDismiss={() => {
        setErr(false)
        setShowToast(false)
      }}
    />
    : null

  const setToast = (isErr, text) => {
    setErr(isErr)
    setToastText(text)
    setShowToast(true)
  }

  const getOrganisations = () => {
    setLoading(true)
    const fetch = authenticatedFetch(contextType)
    fetch(
      // eslint-disable-next-line no-undef
      `${API_HOST}/shopify-app/organisations`,
      config
    )
      .then(r => r.json())
      .then((r) => {
        if (r.status === API_STATUS_SUCCESS) {
          setOrganisations(r.data.organisations)

          setLoading(false)
          return
        }
        throw r.message
      })
      .catch(() => {
        setLoading(false)
        setToast(true, LOADING_DATA_ERROR)
      })
  }

  const handleModalCreate = () => {
    setOpenModalCreate(!openModalCreate)
    setTagErrRes('')
    setOrganisationNameErrRes('')
  }

  const handleCreateOrganisation = ({
    organisationName,
    tags,
    organisationValue,
  }) => {
    setLoadingCreate(true)
    if (organisations.find(o => o.organisationValue === organisationValue)) {
      setOrganisationNameErrRes('Duplicated organisation name!')
      setLoadingCreate(false)
      return
    }

    let duplicatedTag
    organisations.forEach(o => {
      duplicatedTag = tags.find(t => o.tags.includes(t))
    })

    if (duplicatedTag) {
      setTagErrRes(`Duplicated tag: ${ duplicatedTag }`)
      setLoadingCreate(false)
      return
    }

    const fetch = authenticatedFetch(contextType)
    fetch(
      // eslint-disable-next-line no-undef
      `${API_HOST}/shopify-app/organisations`,
      {
        ...config,
        method: 'POST',
        body: JSON.stringify({
          organisation: {
            organisationName,
            tags,
            organisationValue,
          }
        })
      }
    )
      .then(r => r.json())
      .then((r) => {
        setLoadingCreate(false)
        if (r.status === API_STATUS_SUCCESS) {
          const newOrganisations = [ ...organisations, r.data.organisation ]
          setOpenModalCreate(false)
          setOrganisations(newOrganisations)
          return
        }

        if (r.status === API_STATUS_ERROR) {

          setTagErrRes(r.message)
          return
        }

        throw LOADING_DATA_ERROR
      })
      .catch(() => {
        setLoadingCreate(false)
        setOpenModalCreate(false)
        setToast(true, LOADING_DATA_ERROR)
      })
  }

  const handleGenerateKey = (index) => {
    const fetch = authenticatedFetch(contextType)
    fetch(
      // eslint-disable-next-line no-undef
      `${API_HOST}/shopify-app/organisations/${ organisations[index]._id }/generate-key`,
      {
        ...config,
        method: 'POST',
        body: JSON.stringify({})
      }
    )
      .then(r => r.json())
      .then((r) => {
        if (r.status === API_STATUS_SUCCESS) {
          const newOrganisations = [ ...organisations ]
          newOrganisations.splice(index, 1, r.data.organisation)
          setOrganisations(newOrganisations)
          setToast(false, 'SUCCESS')
          return
        }

        throw r.message
      })
      .catch(() => {
        setToast(true, LOADING_DATA_ERROR)
      })
  }

  const handleOpenModalConfirmDelete = (index) => {
    setIndexOrganisation(index)
    setOpenModalConfirmDelete(true)
  }

  const handleConfirmDelete = () => {
    setLoadingConfirmDelete(true)
    const fetch = authenticatedFetch(contextType)
    fetch(
      // eslint-disable-next-line no-undef
      `${API_HOST}/shopify-app/organisations/${ organisations[indexOrganisation]._id }`,
      {
        ...config,
        method: 'DELETE',
        body: JSON.stringify({})
      }
    )
      .then(r => r.json())
      .then((r) => {
        setLoadingConfirmDelete(false)
        setOpenModalConfirmDelete(false)
        if (r.status === API_STATUS_SUCCESS) {
          const newOrganisations = [ ...organisations ]
          newOrganisations.splice(indexOrganisation, 1)
          setIndexOrganisation(0)
          setOrganisations(newOrganisations)
          setToast(false, 'SUCCESS')
          return
        }

        throw r.message
      })
      .catch(() => {
        setLoadingConfirmDelete(false)
        setToast(true, LOADING_DATA_ERROR)
      })
  }

  const handleOpenModalUpdateTags = (index) => {
    setIndexOrganisation(index)
    setOpenModalUpdateTags(true)
    setTagErrRes('')
  }
  const handleUpdateTags = ({ tags }) => {
    setLoadingUpdateTags(true)
    const fetch = authenticatedFetch(contextType)
    fetch(
      // eslint-disable-next-line no-undef
      `${API_HOST}/shopify-app/organisations/${ organisations[indexOrganisation]._id }/update-tags`,
      {
        ...config,
        method: 'POST',
        body: JSON.stringify({
          tags
        })
      }
    )
      .then(r => r.json())
      .then((r) => {
        setLoadingUpdateTags(false)
        if (r.status === API_STATUS_SUCCESS) {
          setOpenModalUpdateTags(false)
          const newOrganisations = [ ...organisations ]
          newOrganisations.splice(indexOrganisation, 1, r.data.organisation)
          setOrganisations(newOrganisations)
          setToast(false, 'SUCCESS')
          return
        }

        if (r.status === API_STATUS_ERROR) {
          setTagErrRes(r.message)
          return
        }

        throw r.message
      })
      .catch(() => {
        setLoadingUpdateTags(false)
        setToast(true, LOADING_DATA_ERROR)
      })
  }

  useEffect(() => {
    getOrganisations()
  }, [])

  return (
    <Page
      title='Organisations'
      primaryAction={{
        content: 'Add new organisation',
        onAction: handleModalCreate,
      }}
      // subtitle={partner.isSyncing ? 'Customer tags is updating. You cannot change or update anything!' : undefined }
      titleMetadata={
        <Badge progress="complete" status="success">
          Running
        </Badge>
      }
      breadcrumbs={[ {
        content: 'Canadian Red Cross Training Partners',
        onAction: () => props.history.push('/')
      } ]}
      fullWidth
      separator
    >
      {
        loading ? (
          <>
            <Loading />
            <PageLoading />
          </>
        ) : (
          <Layout>
            <Layout.Section>
              <Card
              >
                <ListOrganisations
                  organisations={organisations}
                  onGenerateKey={handleGenerateKey}
                  onDeleteOrganisation={handleOpenModalConfirmDelete}
                  onUpdateTags={handleOpenModalUpdateTags}
                />
              </Card>
            </Layout.Section>

            {toast}

            <ModalAddOrganisation
              open={openModalCreate}
              loading={loadingCreate}
              onClose={handleModalCreate}
              onAction={handleCreateOrganisation}
              organisationNameErrRes={organisationNameErrRes}
              tagErrRes={tagErrRes}
            />

            <ModalConfirmDelete
              open={openModalConfirmDelete}
              loading={loadingConfirmDelete}
              onClose={() => setOpenModalConfirmDelete(false)}
              onAction={handleConfirmDelete}
            />

            <ModalUpdateTags
              open={openModalUpdateTags}
              loading={loadingUpdateTags}
              onClose={() => setOpenModalUpdateTags(false)}
              onAction={handleUpdateTags}
              currentTags={organisations.length ? organisations[indexOrganisation].tags : []}
              tagErrRes={tagErrRes}
            />
          </Layout>
        )
      }
    </Page>
  )
}

export default PageOrganisations
