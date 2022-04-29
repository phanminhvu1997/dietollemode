/* eslint-disable no-undef */
import React, { useState, useEffect, useCallback } from 'react'
import { useAppBridge } from '@shopify/app-bridge-react'
import { authenticatedFetch } from '@shopify/app-bridge-utils'

import {
  Page,
  Badge,
  Card,
  TextField,
  Layout,
  Toast,
  Button,
  Stack,
  Thumbnail,
  PageActions,
  Loading,
  FormLayout,
  Tag,
  DropZone,
  Caption,
  TextContainer,
  Scrollable,
} from '@shopify/polaris'

import {
  NoteMinor,
} from '@shopify/polaris-icons'

import PageLoading from '../../components/PageLoading'
import { API_STATUS_SUCCESS } from '@/app/services/constant'

const LOADING_DATA_ERROR = 'Something error!'
const DUPLICATED_TAG_ERROR = 'TAG IS DUPLICATED!'
const SYNTAX_TAG_ERROR = 'TAG CANNOT INCLUDE SPECIALS CHARACTERS!'

const config = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
}
const readCSV = (file) => {
  return new Promise((resolve, reject) => {
    let reader = new FileReader()

    reader.readAsText(file)
    reader.onload = function () {
      const emails = [ ...new Set(reader.result.split(/\r\n|\n/)) ]
        .map(email => email.trim())
        .filter(email => email && !email.includes(' '))

      resolve(emails)
    }

    reader.onerror = function () {
      reject(reader.error)
    }
    reader.onloadstart = function () {
      console.log('onloadstart')
    }
  })
}

const readExcel = (file) => {
  return new Promise((resolve, reject) => {
    resolve()
  })
}

const PagePartner = (props) => {
  const contextType = useAppBridge()

  const [ loading, setLoading ] = useState(false)
  const [ loadingSave, setLoadingSave ] = useState(false)
  const [ loadingSaveTags, setLoadingSaveTags ] = useState(false)
  const [ loadingSaveEmails, setLoadingSaveEmails ] = useState(false)
  const [ toastText, setToastText ] = useState('')
  const [ err, setErr ] = useState(false)
  const [ showToast, setShowToast ] = useState(false)
  const [ partner, setPartner ] = useState({
    tags: [],
  })
  const [ emails, setEmails ] = useState([])
  const [ emailsUpload, setEmailUpload ] = useState([])
  const [ files, setFiles ] = useState([])
  const [ tag, setTag ] = useState('')

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

  const handleAddTag = () => {
    const tagAdd = tag.trim()
    if (!tagAdd) return
    if (tagAdd.includes(',')) {
      setToast(true, SYNTAX_TAG_ERROR)
      return
    }
    if (partner.tags.find(t => t === tagAdd)) {
      setToast(true, DUPLICATED_TAG_ERROR)
      return
    }

    const newData = {
      ...partner,
      tags: [ ...partner.tags, tagAdd ].sort((a, b) => a.localeCompare(b)),
    }

    setTag('')
    setPartner(newData)
  }

  const handleRemoveTag = (tag) => () => {
    const newData = {
      ...partner,
      tags: partner.tags.filter(t => t !== tag),
    }

    setPartner(newData)
  }

  const handleDropZoneDrop = useCallback((acceptedFiles) => {
    setFiles([ acceptedFiles[0] ])
    if (acceptedFiles[0].type === 'text/csv') {
      readCSV(acceptedFiles[0])
        .then(res => setEmailUpload(res))
        .catch(e => setToast(true, 'READ FILE DATA FAIL!'))
    } else {
      readExcel(acceptedFiles[0])
        .then(res => setEmailUpload(res))
        .catch(e => {
          console.log('excel: ', e)
          setToast(true, 'READ FILE DATA FAIL!')
        })
    }
    return acceptedFiles[0]
  }, [])

  const getPartners = () => {
    setLoading(true)
    const fetch = authenticatedFetch(contextType)
    fetch(
      // eslint-disable-next-line no-undef
      `${API_HOST}/shopify-app/partners`,
      config
    )
      .then(r => r.json())
      .then((r) => {
        setLoading(false)

        if (r.status === API_STATUS_SUCCESS) {
          setPartner(r.data.partners[0])
          setEmails(r.data.emails)
          return
        }

        throw LOADING_DATA_ERROR
      })
      .catch(() => {
        setLoading(false)
        setToast(true, LOADING_DATA_ERROR)
      })
  }

  // const handleSave = () => {
  //   setLoadingSave(true)
  //   if (!partner.tags.length) {
  //     setLoadingSave(false)
  //     setToast(true, 'TAG IS REQUIRED!')
  //     return
  //   }
  //   const fetch = authenticatedFetch(contextType)
  //   fetch(
  //     // eslint-disable-next-line no-undef
  //     `${API_HOST}/shopify-app/partners/${partner._id}`,
  //     {
  //       ...config,
  //       method: 'PUT',
  //       body: JSON.stringify({
  //         emails: emailsUpload,
  //         partner,
  //       })
  //     }
  //   )
  //     .then(r => {
  //       console.log(r.ok, r.status)
  //       if (r.ok) {
  //         return r.json()
  //       }
  //       if (r.status === 409) {
  //         throw DUPLICATED_TAG_ERROR
  //       }
  //       throw LOADING_DATA_ERROR
  //     })
  //     .then((r) => {
  //       setPartner(r.partners[0])
  //       setEmails(r.emails)
  //       setFiles([])
  //       setEmailUpload([])

  //       setLoadingSave(false)
  //       setToast(false, 'Success')
  //       return
  //     })
  //     .catch((e) => {
  //       setLoadingSave(false)
  //       setToast(true, e)
  //     })
  // }

  const handleUpdateTags = () => {
    setLoadingSaveTags(true)
    setPartner({
      ...partner,
      isSyncing: true,
    })
    if (!partner.tags.length) {
      setLoadingSaveTags(false)
      setToast(true, 'TAG IS REQUIRED!')
      return
    }
    const fetch = authenticatedFetch(contextType)
    fetch(
      // eslint-disable-next-line no-undef
      `${API_HOST}/shopify-app/partners/${partner._id}`,
      {
        ...config,
        method: 'PUT',
        body: JSON.stringify({
          partner,
        })
      }
    )
      .then(r => r.json())
      .then((r) => {
        if (r.status === API_STATUS_SUCCESS) {
          setPartner(r.data.partners[0])
          setLoadingSaveTags(false)
          setToast(false, 'Success')
          return
        }

        throw r.message
      })
      .catch((e) => {
        setLoadingSaveTags(false)
        setToast(true, 'Connect timeout!')
      })
  }

  const handleUploadEmails = () => {
    if (!emailsUpload.length) {
      setLoadingSaveEmails(false)
      setToast(true, 'EMAILS IS REQUIRED!')
      return
    }

    setLoadingSaveEmails(true)
    setPartner({
      ...partner,
      isSyncing: true,
    })
    const fetch = authenticatedFetch(contextType)
    fetch(
      // eslint-disable-next-line no-undef
      `${API_HOST}/shopify-app/partner-emails/${partner._id}`,
      {
        ...config,
        method: 'POST',
        body: JSON.stringify({
          emails: emailsUpload,
        })
      }
    )
      .then(r => r.json())
      .then((r) => {
        if (r.status === API_STATUS_SUCCESS) {
          setPartner(r.data.partners[0])
          setEmails(r.data.emails)
          setFiles([])
          setEmailUpload([])
          setLoadingSaveEmails(false)
          setToast(false, 'Success')
          return
        }
        throw r.message
      })
      .catch((e) => {
        setLoadingSaveEmails(false)
        setToast(true, 'Connect timeout!')
      })
  }

  // const discardChange = () => {
  //   setFiles([])
  //   setEmailUpload([])
  //   getPartners()
  // }

  useEffect(() => {
    getPartners()
  }, [])

  const uploadedFiles = files.length > 0 && (
    <Stack vertical>
      {files.map((file, index) => (
        <Stack alignment="center" key={index}>
          <Thumbnail
            size="small"
            alt={file.name}
            source={NoteMinor}
          />
          <div>
            {file.name} <Caption>{file.size} bytes</Caption>
          </div>
        </Stack>
      ))}
    </Stack>
  )

  const reviewFileData = emailsUpload.length > 0 && (
    <Card.Section title="Preview file">
      <Scrollable
        style={{ height: '300px' }}
      >
        <ul style={{ listStyleType: 'decimal' }}>
          {emailsUpload.map(email => <li key={email}>{ email }</li>)}
        </ul>
      </Scrollable>
    </Card.Section>
  )

  return (
    <Page
      title='Canadian Red Cross Training Partners'
      primaryAction={{
        content: 'Organisations',
        onAction: () => props.history.push('/organisations')
      }}
      subtitle={partner.isSyncing ? 'Customer tags is updating. You cannot change or update anything!' : undefined }
      titleMetadata={
        partner.isSyncing
          ? <Badge progress="partiallyComplete" status="info">
            Syncing
          </Badge>
          : <Badge progress="complete" status="success">
            Running
          </Badge>
      }
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
            <Layout.Section oneHalf>
              <Card
                title="Tags"
                primaryFooterAction={{
                  content: 'Update tags',
                  onAction: handleUpdateTags,
                  loading: loadingSaveTags,
                  disabled: partner.isSyncing,
                }}
              >
                <Card.Section>
                  <FormLayout>
                    <div onKeyUp={(ev) => {
                      if (ev.key === 'Enter') {
                        handleAddTag()
                      }
                    }}>
                      <TextField
                        label="Add tags"
                        helpText={ SYNTAX_TAG_ERROR }
                        value={ tag }
                        onChange={(val) => setTag(val)}
                        connectedRight={
                          <Button onClick={handleAddTag}>Add</Button>
                        }
                      />
                    </div>
                    <Stack>
                      {(partner.tags || []).map(tag => {
                        return (
                          <Tag key={tag} onRemove={handleRemoveTag(tag)}>{tag}</Tag>
                        )
                      })}
                    </Stack>
                  </FormLayout>
                </Card.Section>
              </Card>
              {!partner.isSyncing ? (
                <Card
                  title="Upload emails"
                  primaryFooterAction={{
                    content: 'Upload and Update customer tags',
                    onAction: handleUploadEmails,
                    loading: loadingSaveEmails,
                  }}
                >
                  <Card.Section>
                    <FormLayout>
                      <DropZone
                        onDropAccepted={handleDropZoneDrop}
                        label="Accept .csv or .xlsx file"
                        type="file"
                        accept=".csv, .xlsx"
                        allowMultiple
                      >
                        <DropZone.FileUpload />
                      </DropZone>
                      { uploadedFiles }
                      { reviewFileData }
                    </FormLayout>
                  </Card.Section>
                </Card>
              ) : null}
            </Layout.Section>
            <Layout.Section oneThird>
              <Card title="Emails uploaded">
                <Card.Section>
                  <TextContainer>
                    {partner.isSyncing
                      ? <p>Updating ...</p>
                      : emails.length ? (
                        <>
                          <p>{`Total emails: ${ emails.length }`}</p>
                          <p>{`Total customers: ${ emails.filter(e => e.customerId).length }`}</p>
                          <p>{`Last uploaded: ${new Date(emails[0].createdAt).toLocaleString()}`}</p>
                        </>
                      ) : null}
                  </TextContainer>
                </Card.Section>
              </Card>
            </Layout.Section>
            {/* <Layout.Section>
              <PageActions
                primaryAction={{
                  content: 'Save',
                  loading: loadingSave,
                  disabled: false,
                  onAction: handleSave,
                }}
                secondaryActions={[
                  {
                    content: 'Discard all changes',
                    onAction: discardChange,
                  },
                ]}
              />
            </Layout.Section> */}
            {toast}
          </Layout>
        )
      }
    </Page>
  )
}

export default PagePartner
