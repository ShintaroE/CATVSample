'use client'

import React from 'react'
import { OrderData } from '../../types'
import OrderForm from '../OrderForm'

interface NewOrderModalProps {
  onClose: () => void
  onCreate: (order: OrderData) => void
}

export default function NewOrderModal({ onClose, onCreate }: NewOrderModalProps) {
  const handleCreate = (data: OrderData) => {
    // 新規作成時の初期値を設定
    const newOrder: OrderData = {
      ...data,
      surveyStatus: '未依頼',
      permissionStatus: '未依頼',
      constructionStatus: '未着手',
      appointmentHistory: [],
    }
    onCreate(newOrder)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 max-w-[800px] shadow-lg rounded-md bg-white mb-10">

        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-gray-900">新規工事依頼を作成</h3>
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
          onSubmit={handleCreate}
          onCancel={onClose}
        />
      </div>
    </div>
  )
}
