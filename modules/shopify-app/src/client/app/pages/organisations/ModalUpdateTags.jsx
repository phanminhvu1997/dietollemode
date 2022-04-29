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

const SYNTAX_TAG_ERROR = 'TAG CANNOT INCLUDE SPECIALS CHARACTERS!'
const DUPLICATED_TAG_ERROR = 'TAG IS DUPLICATED!'

const ModalUpdateTags = ({
  open,
  loading,
  currentTags,
  onClose,
  onAction,
  tagErrRes,
}) => {
  const [ tag, setTag ] = useState('')
  const [ tagErr, setTagErr ] = useState('')
  const [ tags, setTags ] = useState([ ...currentTags ])

  const handleAction = () => {
    onAction({
      tags,
    })
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
    setTag('')
    setTagErr('')
    setTags([ ...currentTags ])
  }, [
    open,
  ])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Update tags"
      primaryAction={{
        loading,
        content: 'Update',
        onAction: handleAction,
        disabled: tags.length === 0,
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

export default ModalUpdateTags
