import React from 'react'

import {
  Modal,
  Card,
  TextContainer,
} from '@shopify/polaris'

const ModalConfirmDelete = ({
  open,
  loading,
  onClose,
  onAction,
}) => {

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete organisation"
      primaryAction={{
        loading,
        content: 'Delete',
        onAction,
        destructive: true,
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
          <TextContainer>
            <p>Are you sure want to delete organisation</p>
            <p style={{ color: 'red' }}>This action can be undone</p>
          </TextContainer>
        </Card.Section>
      </Modal.Section>
    </Modal>
  )
}

export default ModalConfirmDelete
