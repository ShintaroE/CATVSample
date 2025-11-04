'use client'

import React from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface FilterPanelProps {
  filterHooks: {
    teamFilters: any[]
    isFilterPanelOpen: boolean
    setIsFilterPanelOpen: (open: boolean) => void
    getContractorCheckState: (contractorId: string) => 'all' | 'some' | 'none'
    getContractorGroups: () => any[]
    handleToggleAll: (checked: boolean) => void
    handleToggleContractor: (contractorId: string, checked: boolean) => void
    handleToggleTeam: (teamId: string, checked: boolean) => void
  }
}

export default function FilterPanel({ filterHooks }: FilterPanelProps) {
  const contractorGroups = filterHooks.getContractorGroups()

  return (
    <div className="relative">
      <button
        onClick={() => filterHooks.setIsFilterPanelOpen(!filterHooks.isFilterPanelOpen)}
        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        フィルター
        <ChevronDownIcon className={`ml-2 h-4 w-4 transition-transform ${filterHooks.isFilterPanelOpen ? 'rotate-180' : ''}`} />
      </button>

      {filterHooks.isFilterPanelOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
          <div className="p-3 space-y-2">
            {/* すべて選択 */}
            <div className="flex items-center pb-2 border-b border-gray-200">
              <input
                type="checkbox"
                checked={filterHooks.teamFilters.every(f => f.isVisible)}
                onChange={(e) => filterHooks.handleToggleAll(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-900">
                すべて選択
              </label>
            </div>

            {/* 協力会社ごとのフィルター */}
            {contractorGroups.map(contractor => {
              const checkState = filterHooks.getContractorCheckState(contractor.id)
              const colorClass = contractor.color === 'blue' ? 'text-blue-600' :
                               contractor.color === 'green' ? 'text-green-600' :
                               contractor.color === 'purple' ? 'text-purple-600' : 'text-gray-600'

              return (
                <div key={contractor.id} className="mb-2">
                  {/* 協力会社チェックボックス */}
                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                    <div className={`w-3 h-3 rounded-full bg-${contractor.color}-500`} />
                    <input
                      type="checkbox"
                      checked={checkState === 'all'}
                      ref={(el) => {
                        if (el) el.indeterminate = checkState === 'some'
                      }}
                      onChange={(e) => filterHooks.handleToggleContractor(contractor.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-900">{contractor.name}</span>
                  </label>

                  {/* 班チェックボックス */}
                  <div className="ml-8 mt-1 space-y-1">
                    {contractor.teams.map(team => (
                      <label
                        key={team.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={team.isVisible}
                          onChange={(e) => filterHooks.handleToggleTeam(team.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{team.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

