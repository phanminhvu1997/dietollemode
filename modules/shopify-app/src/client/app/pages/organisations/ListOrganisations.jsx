import React, { useState } from 'react'

import {
  Button,
  Stack,
  Tag,
  ButtonGroup,
  Modal,
  Card,
  TextField,
  Badge,
} from '@shopify/polaris'

const ListOrganisations = ({
  organisations,
  onGenerateKey,
  onDeleteOrganisation,
  onUpdateTags,
}) => {
  const [ modalCopy, setModalCopy ] = useState(false)
  const [ textCopy, setTextCopy ] = useState('')

  const handleGenenerateKey = (_id) => () => {
    const index = organisations.findIndex(o => o._id === _id)
    onGenerateKey(index)
  }
  const handleDeleteOrganisation = (_id) => () => {
    const index = organisations.findIndex(o => o._id === _id)
    onDeleteOrganisation(index)
  }
  const handleUpdateTags = (_id) => () => {
    const index = organisations.findIndex(o => o._id === _id)
    onUpdateTags(index)
  }

  const handleModalCopy = () => setModalCopy(!modalCopy)

  const handleGetSettings = (_id) => () => {
    const organisation = organisations.find(o => o._id === _id)
    setTextCopy(`<organisation>${ organisation.organisationValue }</organisation>`)
    handleModalCopy()
  }

  return (
    <>
      <div className="Polaris-DataTable">
        <table className="Polaris-DataTable__Table">
          <thead>
            <tr>
              <th
                data-polaris-header-cell="true"
                className="Polaris-DataTable__Cell Polaris-DataTable__Cell--header"
                style={{ width: '100px' }}
              >
                Organisations
              </th>
              <th
                data-polaris-header-cell="true"
                className="Polaris-DataTable__Cell Polaris-DataTable__Cell--header"
                style={{ width: '100px' }}
              >
                Tags
              </th>
              <th
                data-polaris-header-cell="true"
                className="Polaris-DataTable__Cell Polaris-DataTable__Cell--header"
                style={{ width: '130px' }}
              >
                Register key
              </th>
              <th
                data-polaris-header-cell="true"
                className="Polaris-DataTable__Cell Polaris-DataTable__Cell--header"
                style={{ width: '300px' }}
              >
                Operations
              </th>
            </tr>
          </thead>
          <tbody>
            {organisations.map((org, index) => (
              <tr
                key={`organisations-${ org._id }`}
                className="Polaris-DataTable__TableRow"
              >
                <td className="Polaris-DataTable__Cell">
                  <div className="xo-id-cell">
                    { org.organisationName }
                  </div>
                </td>
                <td className="Polaris-DataTable__Cell">
                  <Stack>
                    {org.tags.map(tag => {
                      return (
                        <Tag key={tag}>{ tag }</Tag>
                      )
                    })}
                  </Stack>
                </td>
                <td className="Polaris-DataTable__Cell">
                  <p>{ org.registerKey }</p>
                </td>
                <td className="Polaris-DataTable__Cell">
                  { org.isSyncing ? (
                    <Badge progress="partiallyComplete" status="info">
                      Customer tags updating...
                    </Badge>
                  ) : (
                    <ButtonGroup>
                      <Button
                        outline
                        size="slim"
                        onClick={handleGetSettings(org._id)}
                      >
                        Get settings
                      </Button>
                      <Button
                        outline
                        size="slim"
                        onClick={handleGenenerateKey(org._id)}
                      >
                        Generate new key
                      </Button>
                      <Button
                        outline
                        size="slim"
                        onClick={handleUpdateTags(org._id)}
                      >
                        Update tags
                      </Button>
                      <Button
                        outline
                        destructive
                        size="slim"
                        onClick={handleDeleteOrganisation(org._id)}
                      >
                        Delete
                      </Button>
                    </ButtonGroup>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalCopy}
        onClose={handleModalCopy}
        title="Page settings"
      >
        <Modal.Section>
          <Card.Section>
            <TextField
              label="Organisation configuration"
              value={ textCopy }
              onChange={ () => {} }
              multiline={1}
              helpText="Copy and paste to Page description you want!"
              readOnly
            />
          </Card.Section>
        </Modal.Section>
      </Modal>
    </>
  )
}

export default ListOrganisations
