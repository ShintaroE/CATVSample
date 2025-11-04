'use client'

import React, { useMemo } from 'react'
import { ScheduleItem, ExclusionEntry, HOUR_HEIGHT, BUSINESS_START_HOUR, BUSINESS_END_HOUR } from '../../../types'

interface DayViewProps {
  selectedDate: string
  onEditSchedule: (schedule: ScheduleItem) => void
  filterHooks: any
  layoutHooks: any
  calendarHooks: any
}

export default function DayView({
  selectedDate,
  onEditSchedule,
  filterHooks,
  layoutHooks,
  calendarHooks,
}: DayViewProps) {
  const visibleColumns = filterHooks.teamFilters.filter((f: any) => f.isVisible)

  const getContractorColor = (contractor: string) => {
    switch (contractor) {
      case '直営班':
        return 'bg-blue-200 border-blue-300 text-blue-900'
      case '栄光電気':
        return 'bg-green-200 border-green-300 text-green-900'
      case 'スライヴ':
        return 'bg-purple-200 border-purple-300 text-purple-900'
      default:
        return 'bg-gray-200 border-gray-300 text-gray-900'
    }
  }

  const getTimeLabel = (exclusion: ExclusionEntry): string => {
    switch (exclusion.timeType) {
      case 'all_day':
        return '終日'
      case 'am':
        return '午前'
      case 'pm':
        return '午後'
      case 'custom':
        return `${exclusion.startTime}-${exclusion.endTime}`
      default:
        return '終日'
    }
  }

  const columnSchedules = useMemo(() => {
    return visibleColumns.map((column: any) => {
      return filterHooks.filteredSchedules.filter((s: ScheduleItem) =>
        s.assignedDate === selectedDate &&
        s.assignedTeams.some((team: any) => team.teamId === column.teamId)
      )
    })
  }, [visibleColumns, filterHooks.filteredSchedules, selectedDate])

  const columnExclusions = useMemo(() => {
    return visibleColumns.map((column: any) => {
      return filterHooks.filteredExclusions.filter((e: ExclusionEntry) =>
        e.teamId === column.teamId && e.date === selectedDate
      )
    })
  }, [visibleColumns, filterHooks.filteredExclusions, selectedDate])

  const timeSlots = layoutHooks.getTimeSlots()
  const columnCount = visibleColumns.length
  const minColumnWidth = 200
  const timeColumnWidth = 60

  if (visibleColumns.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
        フィルターで班を選択してください
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <div style={{ minWidth: `${timeColumnWidth + columnCount * minColumnWidth}px` }}>
          {/* ヘッダー行 */}
          <div className="grid border-b-2 border-gray-300" style={{ gridTemplateColumns: `${timeColumnWidth}px repeat(${columnCount}, minmax(${minColumnWidth}px, 1fr))` }}>
            {/* 時間列ヘッダー */}
            <div className="h-16 border-r-2 border-gray-300 bg-gray-50 flex items-center justify-center sticky left-0 z-20">
              <span className="text-xs font-medium text-gray-700">時間</span>
            </div>
            {/* 班列ヘッダー */}
            {visibleColumns.map((column: any) => (
              <div
                key={`header-${column.teamId}`}
                className="h-16 border-r border-gray-300 bg-white p-2 flex flex-col items-center justify-center"
              >
                <div className="flex items-center space-x-1 mb-0.5">
                  <div className={`w-2 h-2 rounded-full bg-${column.color}-500`} />
                  <span className="text-xs font-semibold text-gray-700 truncate">
                    {column.contractorName}
                  </span>
                </div>
                <span className="text-xs text-gray-500 truncate">{column.teamName}</span>
              </div>
            ))}
          </div>

          {/* 時間グリッドとスケジュールエリア */}
          <div className="relative" style={{ height: `${HOUR_HEIGHT * (BUSINESS_END_HOUR - BUSINESS_START_HOUR + 1)}rem` }}>
            {/* グリッド背景 */}
            <div className="grid" style={{ gridTemplateColumns: `${timeColumnWidth}px repeat(${columnCount}, minmax(${minColumnWidth}px, 1fr))` }}>
              {/* 時間列（背景） */}
              <div className="border-r-2 border-gray-300 bg-gray-50 sticky left-0 z-10">
                {timeSlots.map((time: string, index: number) => (
                  <div
                    key={time}
                    className="border-b border-gray-100 flex items-start justify-center p-1"
                    style={{
                      height: `${HOUR_HEIGHT}rem`
                    }}
                  >
                    <span className="text-xs text-gray-600 font-medium">{time}</span>
                  </div>
                ))}
              </div>

              {/* 班列（背景グリッド） */}
              {visibleColumns.map((column: any, colIdx: number) => (
                <div key={`grid-${column.teamId}`} className="border-r border-gray-100">
                  {timeSlots.map((time: string) => (
                    <div
                      key={`${column.teamId}-${time}`}
                      className="border-b border-gray-100"
                      style={{
                        height: `${HOUR_HEIGHT}rem`
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* スケジュールと除外日の絶対配置レイヤー */}
            <div className="absolute inset-0 pointer-events-none grid" style={{ gridTemplateColumns: `${timeColumnWidth}px repeat(${columnCount}, minmax(${minColumnWidth}px, 1fr))` }}>
              {/* 時間列のスペーサー */}
              <div />

              {/* 班ごとのスケジュールエリア */}
              {visibleColumns.map((column: any, colIdx: number) => {
                const schedules = columnSchedules[colIdx] || []
                const exclusions = columnExclusions[colIdx] || []

                return (
                  <div key={`schedule-${column.teamId}`} className="relative pointer-events-auto">
                    {/* 除外日バー */}
                    {exclusions.map((exclusion: ExclusionEntry, index: number) => (
                      <div
                        key={`exclusion-${exclusion.id}`}
                        className="absolute left-0 right-0 bg-red-50 border-2 border-dashed border-red-500 p-2 shadow-sm cursor-default hover:shadow-md transition-shadow"
                        style={{
                          top: layoutHooks.calculateExclusionTop(exclusion),
                          height: layoutHooks.calculateExclusionHeight(exclusion),
                          zIndex: 10 + index
                        }}
                        title={`除外日: ${getTimeLabel(exclusion)} - ${exclusion.reason}`}
                      >
                        <div className="text-xs text-red-700 font-bold flex items-center space-x-1">
                          <span>🚫</span>
                          <span>{getTimeLabel(exclusion)}</span>
                        </div>
                        <div className="text-xs text-red-600 italic truncate mt-1">
                          {exclusion.reason}
                        </div>
                      </div>
                    ))}

                    {/* スケジュールバー */}
                    {schedules.map((schedule: ScheduleItem, index: number) => {
                      const scheduleHeight = layoutHooks.calculateScheduleHeight(schedule.timeSlot)
                      const heightValue = parseFloat(scheduleHeight)

                      return (
                        <div
                          key={schedule.id}
                          className={`absolute left-0 right-0 rounded border-l-4 shadow-sm cursor-pointer hover:shadow-lg hover:z-50 transition-all ${getContractorColor(schedule.contractor)}`}
                          style={{
                            top: layoutHooks.calculateScheduleTop(schedule.timeSlot),
                            height: scheduleHeight,
                            zIndex: 1 + index
                          }}
                          onClick={() => onEditSchedule(schedule)}
                        >
                          <div className="p-2 h-full overflow-hidden">
                            <div className="text-xs font-bold truncate">{schedule.customerName}</div>
                            <div className="text-xs opacity-90 truncate">{schedule.workType}</div>
                            {heightValue > 3 && (
                              <>
                                <div className="text-xs opacity-75 truncate mt-0.5">{schedule.address}</div>
                                <div className="text-xs opacity-75 truncate">{schedule.timeSlot}</div>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
