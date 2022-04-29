import React, { useState, useEffect } from 'react'

import {
  Modal,
  TextField,
  Card,
  FormLayout,
  Button,
  Stack,
  Tag,
} from '@shopify/polaris'

import {
  handelize,
} from '../../services/helper'

const SYNTAX_TAG_ERROR = 'TAG CANNOT INCLUDE SPECIALS CHARACTERS!'
const DUPLICATED_TAG_ERROR = 'TAG IS DUPLICATED!'

const ModalAddOrganisation = ({
  open,
  loading,
  onClose,
  onAction,
  organisationNameErrRes,
  tagErrRes,
}) => {
  const [ organisationName, setOrganisationName ] = useState('')
  const [ organisationNameErr, setOrganisationNameErr ] = useState('')
  const [ tag, setTag ] = useState('')
  const [ tagErr, setTagErr ] = useState('')
  const [ tags, setTags ] = useState([])

  const handleAction = () => {
    onAction({
      organisationName,
      tags,
      organisationValue: handelize(organisationName),
    })
  }

  const handleChangeOrganisationName = (val = '') => {
    setOrganisationName(val)
    setOrganisationNameErr('')
  }

  const handleChangeTag = (val) => {
    setTag(val)
    setTagErr('')
  }

  const handleAddTag = () => {
    const tagAdd = tag.trim()
    if (!tagAdd) return
    if (tagAdd.includes(',')) {
      setTagErr(SYNTAX_TAG_ERROR)
      return
    }
    if (tags.includes(tagAdd)) {
      setTagErr(DUPLICATED_TAG_ERROR)
      return
    }

    const newData = [ ...tags, tagAdd ].sort((a, b) => a.localeCompare(b))

    setTag('')
    setTags(newData)
  }

  const handleRemoveTag = (tagRemove) => () => {
    const newTags = tags.filter(t => t !== tagRemove)
    setTags(newTags)
  }

  useEffect(() => {
    setOrganisationName('')
    setOrganisationNameErr('')
    setTag('')
    setTagErr('')
    setTags([])
  }, [
    open,
  ])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add new organisation"
      primaryAction={{
        loading,
        content: 'Create',
        onAction: handleAction,
        disabled: tags.length === 0 || !organisationName.trim(),
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <Card.Section>
          <FormLayout>
            <TextField
              label="Organisation name"
              value={ organisationName }
              onChange={ handleChangeOrganisationName }
              helpText={ `Unique organisation key: ${handelize(organisationName)}` }
              clearButton
              onClearButtonClick={ () => handleChangeOrganisationName('') }
              error={ organisationNameErrRes || organisationNameErr }
            />
          </FormLayout>
        </Card.Section>
        <Card.Section>
          <FormLayout>
            <div onKeyUp={(ev) => {
              if (ev.key === 'Enter') {
                handleAddTag()
              }
            }}>
              <TextField
                label="Add tags"
                value={ tag }
                helpText={ SYNTAX_TAG_ERROR }
                onChange={ handleChangeTag }
                error={ tagErrRes || tagErr }
                connectedRight={
                  <Button onClick={ handleAddTag }>Add</Button>
                }
              />
            </div>
            <Stack>
              {(tags || []).map(tag => {
                return (
                  <Tag key={tag} onRemove={ handleRemoveTag(tag) }>{ tag }</Tag>
                )
              })}
            </Stack>
          </FormLayout>
        </Card.Section>
      </Modal.Section>
    </Modal>
  )
}

export default ModalAddOrganisation
