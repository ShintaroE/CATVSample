'use client'

import React from 'react'
import {
  RequestType,
  AttachmentRequest,
} from '@/features/applications/types'
import { Contractor } from '@/features/contractor/types'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import AttachmentForm from './AttachmentForm'

interface NewAttachmentModalProps {
  contractors: Contractor[]
  onClose: () => void
  onCreate: (
    type: RequestType,
    data: Partial<AttachmentRequest>
  ) => void
}

export default function NewAttachmentModal({
  contractors,
  onClose,
  onCreate,
}: NewAttachmentModalProps) {

  const handleCreate = (data: Partial<AttachmentRequest>) => {
    const newData: Partial<AttachmentRequest> = {
      ...data,
      type: 'attachment',
    }
    onCreate('attachment', newData)
  }

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-5xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              新規共架・添架依頼
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <AttachmentForm
            contractors={contractors}
            onSubmit={handleCreate}
            onCancel={onClose}
          />
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
