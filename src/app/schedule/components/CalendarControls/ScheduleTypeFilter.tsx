'use client'

import React from 'react'
import { ScheduleType } from '../../types'
import { ScheduleTypeFilter as ScheduleTypeFilterType } from '../../hooks/useFilters'

interface ScheduleTypeFilterProps {
  scheduleTypeFilter: ScheduleTypeFilterType
  isOpen: boolean
  onToggle: () => void
  onToggleType: (type: ScheduleType) => void
}

export default function ScheduleTypeFilter({
  scheduleTypeFilter,
  isOpen,
  onToggle,
  onToggleType,
}: ScheduleTypeFilterProps) {
  // 選択数をカウント
  const selectedCount = Object.values(scheduleTypeFilter).filter(Boolean).length
  const totalCount = 2

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2"
      >
        <span className="text-sm font-medium text-gray-700">種別</span>
        <span className="text-xs text-gray-500">
          {selectedCount}/{totalCount}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 z-20 bg-white border border-gray-300 rounded-md shadow-lg min-w-[200px]">
          <div className="py-2">
            <label className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={scheduleTypeFilter.construction}
                onChange={() => onToggleType('construction')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700 flex items-center gap-2">
                🔧 工事
              </span>
            </label>
            <label className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={scheduleTypeFilter.survey}
                onChange={() => onToggleType('survey')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700 flex items-center gap-2">
                📋 現地調査
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
