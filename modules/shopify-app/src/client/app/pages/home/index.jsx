/* eslint-disable no-undef */
import React, { useState, useEffect, useCallback } from 'react'
import { useAppBridge } from '@shopify/app-bridge-react'
import { authenticatedFetch } from '@shopify/app-bridge-utils'
import Highlighter from 'react-highlight-words'
import {
  Page,
  Badge,
  Card,
  TextField,
  Layout,
  Toast,
  Loading,
  Icon,
} from '@shopify/polaris'

import {
  SearchMinor,
} from '@shopify/polaris-icons'
import {
  Table,
  Space,
  Button as ButtonAntd
} from 'antd'

import PageLoading from '../../components/PageLoading'
import { API_STATUS_SUCCESS } from '@/app/services/constant'

const LOADING_DATA_ERROR = 'Something error!'

const config = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
}

const PAWPASS_1 = 'PAWPASS_1'
const PAWPASS_3 = 'PAWPASS_3'
const PAWPASS_12 = 'PAWPASS_12'

const filterPawpassMonth = (filterVal, valueCompare) => {
  return filterVal === PAWPASS_1
    ? valueCompare < 3
    : filterVal === PAWPASS_3
      ? 3 <= valueCompare && valueCompare < 12
      : filterVal === PAWPASS_12
        ? 12 <= valueCompare
        : true
}

const TableData = ({ pawpassData = [], searchText }) => {
  const [ filteredInfo, setFilteredInfo ] = useState({})
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 40,
      render(text) {
        return searchText ? (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[ searchText ]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text
        )
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: 40,
      // eslint-disable-next-line react/display-name
      render: (text) =>  searchText ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[ searchText ]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
    },
    {
      title: 'Pet\'s birthday',
      dataIndex: 'petBirthStr',
      width: 20,
      sorter: {
        compare: (a, b) => Number(a.petBirthStr) - Number(b.petBirthStr),
        multiple: 2,
      },
    },
    {
      title: 'Pawpass month',
      dataIndex: 'pawpassMonth',
      width: 20,
      sorter: {
        compare: (a, b) => {
          return Number(a.pawpassMonth) - Number(b.pawpassMonth)
        },
        multiple: 1,
      },
      filters: [
        { text: '1 Month Pawpass', value: PAWPASS_1 },
        { text: '3 Months Pawpass', value: PAWPASS_3 },
        { text: '12 Months Pawpass', value: PAWPASS_12 },
      ],
      filteredValue: filteredInfo.pawpassMonth || null,
      filterMultiple: false,
      onFilter: (value, record) => filterPawpassMonth(value, record.pawpassMonth),
    },
  ]

  const data = pawpassData
    .map(({ customerId, firstName, lastName, email, petBirthStr, pawpassMonth }) => ({
      key: customerId,
      name: `${firstName} ${lastName}`.trim() || 'N/A',
      email,
      petBirthStr,
      pawpassMonth
    }))
    .filter(
      ({ name, email }) => name.toLowerCase().includes(searchText.toLowerCase())
        || email.toLowerCase().includes(searchText.toLowerCase())
    )

  const {
    pawpassMonth,
  } = filteredInfo
  const monthFilter = pawpassMonth && pawpassMonth.length && pawpassMonth[0]
  const sumaryTotals = data.filter((record) => filterPawpassMonth(monthFilter, record.pawpassMonth)).length
  const sumary = () => (
    <Table.Summary fixed>
      <Table.Summary.Row>
        <Table.Summary.Cell index={0}>Totals</Table.Summary.Cell>
        <Table.Summary.Cell index={1}>{sumaryTotals}</Table.Summary.Cell>
      </Table.Summary.Row>
    </Table.Summary>
  )

  const handleChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters)
  }
  const handleClearFilter = useCallback(
    () => setFilteredInfo({}),
    [ filteredInfo ]
  )
  return (
    <>
      <Space style={{ marginBottom: 16, marginTop: 18 }}>
        <ButtonAntd onClick={handleClearFilter}>Clear filters</ButtonAntd>
      </Space>
      <Table
        columns={columns}
        dataSource={data}
        bordered
        summary={sumary}
        onChange={handleChange}
      />
    </>
  )
}

const HomePage = (props) => {
  const contextType = useAppBridge()
  const [ loading, setLoading ] = useState(false)
  const [ loadingSave, setLoadingSave ] = useState(false)
  const [ toastText, setToastText ] = useState('')
  const [ err, setErr ] = useState(false)
  const [ showToast, setShowToast ] = useState(false)
  const [ pawpass, setPawpass ] = useState([])
  const [ findVal, setFindVal ] = useState('')

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

  const getPawpass = () => {
    setLoading(true)
    const fetch = authenticatedFetch(contextType)
    fetch(
      // eslint-disable-next-line no-undef
      `${API_HOST}/shopify-app/pawpass`,
      config
    )
      .then(r => r.json())
      .then((r) => {
        setLoading(false)

        if (r.status === API_STATUS_SUCCESS) {
          setPawpass(r.data.pawpass.sort((a, b) => Number(b.pawpassMonth) - Number(a.pawpassMonth)))
          return
        }

        throw LOADING_DATA_ERROR
      })
      .catch(() => {
        setLoading(false)
        setToast(true, LOADING_DATA_ERROR)
      })
  }

  const handleChangeFindText = useCallback((val) => setFindVal(val))
  const handleClearFindText = useCallback(() => setFindVal(''))
  useEffect(() => {
    getPawpass()
  }, [])

  return (
    <Page
      title='Vetniquelabs app'
      titleMetadata={
        <Badge progress="complete" status="success">
          Running
        </Badge>
      }
      subtitle="Pawpass members"
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
              <Card>
                <Card.Section>
                  <TextField
                    label="Search"
                    placeholder="Find member"
                    clearButton
                    inputMode="search"
                    type="search"
                    prefix={<Icon source={SearchMinor}/>}
                    onClearButtonClick={handleClearFindText}
                    value={findVal}
                    onChange={handleChangeFindText}
                  />
                </Card.Section>
              </Card>
              <TableData
                pawpassData={pawpass}
                searchText={findVal}
              />
            </Layout.Section>
            {toast}
          </Layout>
        )
      }
    </Page>
  )
}

export default HomePage
