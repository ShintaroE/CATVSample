'use client'

import React from 'react'
import { ViewMode } from '../../types'

interface ViewModeSwitcherProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export default function ViewModeSwitcher({
  viewMode,
  onViewModeChange,
}: ViewModeSwitcherProps) {
  return (
    <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-md">
      <button
        onClick={() => onViewModeChange('month')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          viewMode === 'month'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        月
      </button>
      <button
        onClick={() => onViewModeChange('week')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          viewMode === 'week'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        週
      </button>
      <button
        onClick={() => onViewModeChange('day')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          viewMode === 'day'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        日
      </button>
    </div>
  )
}

