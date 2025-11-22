'use client'

import React from 'react'
import { OrderData } from '../../types'
import OrderForm from '../OrderForm'

interface EditOrderModalProps {
  order: OrderData
  onClose: () => void
  onUpdate: (order: OrderData) => void
}

export default function EditOrderModal({ order, onClose, onUpdate }: EditOrderModalProps) {
  const handleUpdate = (data: OrderData) => {
    onUpdate(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 max-w-[800px] shadow-lg rounded-md bg-white mb-10">

        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-gray-900">工事依頼を編集</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            type="button"
          >
            <span className="sr-only">閉じる</span>
            ✕
          </button>
        </div>

        <OrderForm
          initialData={order}
          onSubmit={handleUpdate}
          onCancel={onClose}
          isEditing={true}
        />
      </div>
    </div>
  )
}
