'use client'

import React from 'react'
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { useScheduleViewer } from '../../../hooks/useScheduleViewer'
import MonthView from './MonthView'
import WeekView from './WeekView'

export default function ScheduleViewer() {
  const scheduleHooks = useScheduleViewer()

  return (
    <div className="mb-6 bg-white border rounded-lg p-4">
      <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
        <CalendarDaysIcon className="h-5 w-5 mr-2" />
        スケジュール確認
      </h4>

      {/* カレンダーナビゲーション */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => scheduleHooks.calendarViewMode === 'month' 
              ? scheduleHooks.navigateScheduleMonth('prev') 
              : scheduleHooks.navigateScheduleWeek('prev')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <h4 className="text-lg font-semibold text-gray-900">
            {scheduleHooks.calendarViewMode === 'month'
              ? `${scheduleHooks.scheduleCalendarDate.getFullYear()}年${scheduleHooks.scheduleCalendarDate.getMonth() + 1}月`
              : scheduleHooks.getWeekRangeLabel()
            }
          </h4>
          <button
            onClick={() => scheduleHooks.calendarViewMode === 'month' 
              ? scheduleHooks.navigateScheduleMonth('next') 
              : scheduleHooks.navigateScheduleWeek('next')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {/* 表示モード切り替え */}
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-md">
            <button
              onClick={() => scheduleHooks.setCalendarViewMode('month')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                scheduleHooks.calendarViewMode === 'month'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📅 月
            </button>
            <button
              onClick={() => scheduleHooks.setCalendarViewMode('week')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                scheduleHooks.calendarViewMode === 'week'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 週
            </button>
          </div>

          {/* フィルターボタン */}
          <div className="relative">
            <button
              onClick={() => scheduleHooks.setShowFilterPanel(!scheduleHooks.showFilterPanel)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              フィルター
              {scheduleHooks.visibleFilterCount < scheduleHooks.totalFilterCount && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {scheduleHooks.visibleFilterCount}/{scheduleHooks.totalFilterCount}
                </span>
              )}
            </button>

            {/* フィルターパネル */}
            {scheduleHooks.showFilterPanel && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                <div className="p-3 space-y-2">
                  {/* すべて選択 */}
                  <div className="flex items-center pb-2 border-b border-gray-200">
                    <input
                      type="checkbox"
                      checked={scheduleHooks.visibleFilterCount === scheduleHooks.totalFilterCount}
                      onChange={(e) => scheduleHooks.handleToggleAll(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-900">
                      すべて選択
                      <span className="ml-2 text-xs text-gray-500">
                        ({scheduleHooks.visibleFilterCount}/{scheduleHooks.totalFilterCount})
                      </span>
                    </label>
                  </div>

                  {/* 協力会社ごとのフィルター */}
                  {Array.from(new Set(scheduleHooks.teamFilters.map(f => f.contractorId))).map(contractorId => {
                    const contractorTeams = scheduleHooks.teamFilters.filter(f => f.contractorId === contractorId)
                    const checkState = scheduleHooks.getContractorCheckState(contractorId)
                    const colorClass = contractorTeams[0]?.color === 'blue' ? 'text-blue-600' :
                                     contractorTeams[0]?.color === 'green' ? 'text-green-600' :
                                     contractorTeams[0]?.color === 'purple' ? 'text-purple-600' : 'text-gray-600'

                    return (
                      <div key={contractorId} className="space-y-1">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={checkState !== 'none'}
                            ref={el => {
                              if (el) el.indeterminate = checkState === 'some'
                            }}
                            onChange={(e) => scheduleHooks.handleToggleContractor(contractorId, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm font-medium text-gray-900 flex items-center">
                            <span className={`mr-2 ${colorClass}`}>●</span>
                            {contractorTeams[0]?.contractorName}
                            <span className="ml-2 text-xs text-gray-500">
                              ({contractorTeams.filter(t => t.isVisible).length}/{contractorTeams.length})
                            </span>
                          </label>
                        </div>

                        {/* 班フィルター */}
                        <div className="ml-6 space-y-1">
                          {contractorTeams.map(team => (
                            <div key={team.teamId} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={team.isVisible}
                                onChange={(e) => scheduleHooks.handleToggleTeam(team.teamId, e.target.checked)}
                                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label className="ml-2 text-sm text-gray-700">
                                {team.teamName}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 月表示 */}
      {scheduleHooks.calendarViewMode === 'month' && (
        <MonthView scheduleHooks={scheduleHooks} />
      )}

      {/* 週表示 */}
      {scheduleHooks.calendarViewMode === 'week' && (
        <WeekView scheduleHooks={scheduleHooks} />
      )}
    </div>
  )
}

