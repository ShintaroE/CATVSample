import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface ScheduleTypeFilterProps {
  scheduleTypeFilter: {
    construction: boolean
    survey: boolean
  }
  onFilterChange: (filter: { construction: boolean; survey: boolean }) => void
}

/**
 * スケジュール種別フィルターコンポーネント
 * 工事/現地調査の表示切り替え
 */
export default function ScheduleTypeFilter({
  scheduleTypeFilter,
  onFilterChange
}: ScheduleTypeFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const allSelected = scheduleTypeFilter.construction && scheduleTypeFilter.survey
  const selectedCount =
    (scheduleTypeFilter.construction ? 1 : 0) +
    (scheduleTypeFilter.survey ? 1 : 0)

  const handleToggleAll = () => {
    if (allSelected) {
      onFilterChange({ construction: false, survey: false })
    } else {
      onFilterChange({ construction: true, survey: true })
    }
  }

  const handleToggleType = (type: 'construction' | 'survey') => {
    onFilterChange({
      ...scheduleTypeFilter,
      [type]: !scheduleTypeFilter[type]
    })
  }

  return (
    <div className="relative inline-block">
      {/* フィルターボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
      >
        <span className="text-sm font-medium">
          種別フィルター ({selectedCount}/2)
        </span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* ドロップダウンパネル */}
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* パネル */}
          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-2">
              {/* 全て選択/解除 */}
              <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleToggleAll}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-gray-700">全て</span>
              </label>

              <div className="border-t border-gray-200 my-1" />

              {/* 工事 */}
              <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduleTypeFilter.construction}
                  onChange={() => handleToggleType('construction')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">🔧 工事</span>
              </label>

              {/* 現地調査 */}
              <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduleTypeFilter.survey}
                  onChange={() => handleToggleType('survey')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">📋 現地調査</span>
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
