import React, { useState } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { AdditionalCostsFilter as AdditionalCostsFilterType } from '../hooks/useOrderFilters'
import { Badge } from '@/shared/components/ui'

interface AdditionalCostsFilterProps {
  filter: AdditionalCostsFilterType
  onUpdate: (filter: AdditionalCostsFilterType) => void
}

export default function AdditionalCostsFilter({ filter, onUpdate }: AdditionalCostsFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  // チェック数をカウント
  const selectedCount = [
    filter.closureExpansion,
    filter.roadApplication,
    filter.otherCompanyRepair,
    filter.nwEquipment,
    filter.serviceLineApplication
  ].filter(Boolean).length

  const handleToggle = () => {
    setIsOpen(prev => !prev)
  }

  const handleCheckboxChange = (key: keyof Omit<AdditionalCostsFilterType, 'enabled'>) => {
    const newFilter = {
      ...filter,
      [key]: !filter[key]
    }

    // いずれかがチェックされていればenabledをtrue、すべて未チェックならfalse
    const hasAnyChecked = Object.entries(newFilter).some(([k, v]) => k !== 'enabled' && v === true)
    newFilter.enabled = hasAnyChecked

    onUpdate(newFilter)
  }

  return (
    <div className="border border-gray-200 rounded-md">
      {/* アコーディオンヘッダー */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDownIcon className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 text-gray-500" />
          )}
          <span>各種追加費用</span>
          {selectedCount > 0 && (
            <Badge variant="info" size="sm">
              {selectedCount}件選択中
            </Badge>
          )}
        </div>
      </button>

      {/* アコーディオンコンテンツ */}
      {isOpen && (
        <div className="px-4 py-3 border-t border-gray-200 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="closureExpansion"
              checked={filter.closureExpansion}
              onChange={() => handleCheckboxChange('closureExpansion')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="closureExpansion" className="text-sm text-gray-700 cursor-pointer">
              クロージャ増設
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="roadApplication"
              checked={filter.roadApplication}
              onChange={() => handleCheckboxChange('roadApplication')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="roadApplication" className="text-sm text-gray-700 cursor-pointer">
              道路申請
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="otherCompanyRepair"
              checked={filter.otherCompanyRepair}
              onChange={() => handleCheckboxChange('otherCompanyRepair')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="otherCompanyRepair" className="text-sm text-gray-700 cursor-pointer">
              他社改修
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="nwEquipment"
              checked={filter.nwEquipment}
              onChange={() => handleCheckboxChange('nwEquipment')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="nwEquipment" className="text-sm text-gray-700 cursor-pointer">
              NWスパハンなど
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="serviceLineApplication"
              checked={filter.serviceLineApplication}
              onChange={() => handleCheckboxChange('serviceLineApplication')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="serviceLineApplication" className="text-sm text-gray-700 cursor-pointer">
              引込用申請
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
