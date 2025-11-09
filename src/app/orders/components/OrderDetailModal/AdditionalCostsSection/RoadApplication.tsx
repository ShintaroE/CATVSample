'use client'

import React from 'react'
import { AdditionalCosts } from '@/app/orders/types'

interface RoadApplicationProps {
  data: AdditionalCosts['roadApplication']
  onChange: (data: AdditionalCosts['roadApplication']) => void
  isOpen: boolean
  onToggle: () => void
}

export default function RoadApplication({
  data,
  onChange,
  isOpen,
  onToggle,
}: RoadApplicationProps) {
  const isFieldDisabled = data.required === 'not_required'

  return (
    <div className="bg-white p-3 rounded border">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left hover:bg-gray-50 -m-3 p-3 rounded"
      >
        <h5 className="text-sm font-medium text-gray-900">道路申請</h5>
        <span className="text-gray-500">{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
          <div>
            <label className="block font-medium text-gray-900 mb-1">
              道路申請要否
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
              申請日
            </label>
            <input
              type="date"
              value={data.applicationDate || ''}
              onChange={(e) =>
                onChange({ ...data, applicationDate: e.target.value })
              }
              disabled={isFieldDisabled}
              className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isFieldDisabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-900'
              }`}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-900 mb-1">
              申請回答日
            </label>
            <input
              type="date"
              value={data.responseDate || ''}
              onChange={(e) =>
                onChange({ ...data, responseDate: e.target.value })
              }
              disabled={isFieldDisabled}
              className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isFieldDisabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-900'
              }`}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-900 mb-1">
              完了報告
            </label>
            <select
              value={data.completionReport}
              onChange={(e) =>
                onChange({
                  ...data,
                  completionReport: e.target.value as 'incomplete' | 'completed',
                })
              }
              disabled={isFieldDisabled}
              className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isFieldDisabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-900'
              }`}
            >
              <option value="incomplete">未了</option>
              <option value="completed">完了</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
