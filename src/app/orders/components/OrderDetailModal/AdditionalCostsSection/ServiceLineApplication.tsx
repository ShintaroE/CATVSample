'use client'

import React from 'react'
import { AdditionalCosts } from '@/app/orders/types'

interface ServiceLineApplicationProps {
  data: AdditionalCosts['serviceLineApplication']
  onChange: (data: AdditionalCosts['serviceLineApplication']) => void
  isOpen: boolean
  onToggle: () => void
}

export default function ServiceLineApplication({
  data,
  onChange,
  isOpen,
  onToggle,
}: ServiceLineApplicationProps) {
  const isFieldDisabled = data.required === 'not_required'

  return (
    <div className="bg-white p-3 rounded border">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left hover:bg-gray-50 -m-3 p-3 rounded"
      >
        <h5 className="text-sm font-medium text-gray-900">引込用申請</h5>
        <span className="text-gray-500">{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
          <div>
            <label className="block font-medium text-gray-900 mb-1">
              引込用専用申請要否
            </label>
            <select
              value={data.required}
              onChange={(e) =>
                onChange({
                  ...data,
                  required: e.target.value as 'required' | 'not_required',
                })
              }
              className="w-full bg-white text-gray-900 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="not_required">否</option>
              <option value="required">要</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-900 mb-1">
              申請請求日
            </label>
            <input
              type="date"
              value={data.billingDate || ''}
              onChange={(e) =>
                onChange({ ...data, billingDate: e.target.value })
              }
              disabled={isFieldDisabled}
              className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isFieldDisabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-900'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  )
}
