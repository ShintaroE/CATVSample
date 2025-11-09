'use client'

import React, { useState } from 'react'
import { AdditionalNotes } from '../../types'

interface AdditionalNotesSectionProps {
  data: AdditionalNotes
  onChange: (data: AdditionalNotes) => void
}

export default function AdditionalNotesSection({
  data,
  onChange,
}: AdditionalNotesSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-t pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <h4 className="text-md font-medium text-gray-900">
          各追加情報 {isOpen ? '▼' : '▶'}
        </h4>
      </button>

      {isOpen && (
        <div className="bg-gray-50 p-4 rounded-md mt-2 space-y-4">
          {/* 現調依頼備考 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              現調依頼備考
            </label>
            <textarea
              rows={3}
              value={data.surveyRequestNotes || ''}
              onChange={(e) =>
                onChange({ ...data, surveyRequestNotes: e.target.value })
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
              placeholder="現地調査依頼に関する備考を入力..."
            />
          </div>

          {/* 共架・添架依頼備考 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              共架・添架依頼備考
            </label>
            <textarea
              rows={3}
              value={data.attachmentRequestNotes || ''}
              onChange={(e) =>
                onChange({ ...data, attachmentRequestNotes: e.target.value })
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
              placeholder="共架・添架依頼に関する備考を入力..."
            />
          </div>

          {/* 工事依頼備考 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              工事依頼備考
            </label>
            <textarea
              rows={3}
              value={data.constructionRequestNotes || ''}
              onChange={(e) =>
                onChange({ ...data, constructionRequestNotes: e.target.value })
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
              placeholder="工事依頼に関する備考を入力..."
            />
          </div>
        </div>
      )}
    </div>
  )
}
