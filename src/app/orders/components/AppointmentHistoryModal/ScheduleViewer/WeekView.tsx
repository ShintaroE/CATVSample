'use client'

import React from 'react'
import { useScheduleViewer } from '../../../hooks/useScheduleViewer'

interface WeekViewProps {
  scheduleHooks: ReturnType<typeof useScheduleViewer>
}

export default function WeekView({ scheduleHooks }: WeekViewProps) {
  const getExclusionTimeText = (exclusion: any) => {
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
        return ''
    }
  }

  const getExclusionTimeSlot = (exclusion: any): string => {
    switch (exclusion.timeType) {
      case 'all_day':
        return '09:00-18:00'
      case 'am':
        return '09:00-12:00'
      case 'pm':
        return '12:00-18:00'
      case 'custom':
        return `${exclusion.startTime}-${exclusion.endTime}`
      default:
        return '09:00-18:00'
    }
  }

  const calculateTopPosition = (timeSlot: string): string => {
    if (timeSlot === '終日') return '0rem'
    const [startTime] = timeSlot.split('-')
    const [hour, minute] = startTime.split(':').map(Number)
    const minutesFromStart = (hour - 9) * 60 + minute
    return `${(minutesFromStart / 60) * 4}rem`
  }

  const calculateHeight = (timeSlot: string): string => {
    if (timeSlot === '終日') return '36rem'
    const [startTime, endTime] = timeSlot.split('-')
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute
    const durationMinutes = endMinutes - startMinutes
    return `${Math.max((durationMinutes / 60) * 4, 2)}rem`
  }

  const getHourlyTimeSlots = () => {
    const slots: string[] = []
    for (let hour = 9; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
    }
    return slots
  }

  const calculateSeparatedLayout = (schedules: any[], exclusions: any[], teamId: string, dateStr: string) => {
    const daySchedules = schedules.filter(s =>
      s.assignedDate === dateStr &&
      s.assignedTeams?.some((t: any) => t.teamId === teamId)
    )
    const dayExclusions = exclusions.filter(e =>
      e.date === dateStr && e.teamId === teamId
    )

    if (dayExclusions.length > 0 && daySchedules.length > 0) {
      return {
        exclusions: dayExclusions.map((e: any) => ({
          data: e,
          width: '50%',
          left: '0%'
        })),
        schedules: daySchedules.map((s: any) => ({
          data: s,
          width: '50%',
          left: '50%'
        }))
      }
    }

    return {
      exclusions: dayExclusions.map((e: any) => ({
        data: e,
        width: '100%',
        left: '0%'
      })),
      schedules: daySchedules.map((s: any) => ({
        data: s,
        width: '100%',
        left: '0%'
      }))
    }
  }

  const teamGroups = scheduleHooks.getTeamGroups()
  const weekColumns = scheduleHooks.getWeekViewColumns()
  const columnWidth = scheduleHooks.getColumnWidth(teamGroups.length)
  const totalColumns = weekColumns.length

  if (teamGroups.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        フィルターで班を選択してください
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        {/* 2段ヘッダー */}
        <div className="grid border-b-2 border-gray-300" style={{gridTemplateColumns: `60px repeat(${totalColumns}, ${columnWidth})`}}>
          {/* 第1行: 左上の空白 + 班名（7列span） */}
          <div className="bg-gray-100 border-r border-gray-300" />
          {teamGroups.map((group) => (
            <div
              key={group.teamId}
              className={`text-center font-semibold text-sm py-2 border-r border-gray-300 ${
                group.color === 'blue' ? 'bg-blue-100 text-blue-900' :
                group.color === 'green' ? 'bg-green-100 text-green-900' :
                group.color === 'purple' ? 'bg-purple-100 text-purple-900' : 'bg-gray-100'
              }`}
              style={{gridColumn: `span ${group.columnCount}`}}
            >
              {group.displayName}
            </div>
          ))}
        </div>

        {/* 第2行: 時刻列ヘッダー + 日付（各1列） */}
        <div className="grid border-b border-gray-300" style={{gridTemplateColumns: `60px repeat(${totalColumns}, ${columnWidth})`}}>
          <div className="bg-gray-50 text-center text-xs font-medium text-gray-600 py-2 border-r border-gray-300">
            時刻
          </div>
          {weekColumns.map((col) => (
            <div
              key={`${col.teamId}-${col.dateStr}`}
              className="bg-gray-50 text-center text-xs font-medium text-gray-700 py-2 border-r border-gray-300"
            >
              {col.displayName}
            </div>
          ))}
        </div>

        {/* タイムグリッド */}
        <div className="relative">
          {/* 背景: 時間行 */}
          {getHourlyTimeSlots().map((hour) => (
            <div
              key={hour}
              className="grid border-b border-gray-100"
              style={{gridTemplateColumns: `60px repeat(${totalColumns}, ${columnWidth})`, height: '4rem'}}
            >
              {/* 時刻セル */}
              <div className="bg-gray-50 text-center text-xs text-gray-600 py-1 border-r-2 border-gray-300 flex items-start justify-center">
                {hour}
              </div>
              {/* 空の列セル */}
              {weekColumns.map((col) => (
                <div
                  key={`${col.teamId}-${col.dateStr}-${hour}`}
                  className="border-r border-gray-200"
                />
              ))}
            </div>
          ))}

          {/* 前景: スケジュールと除外日の絶対配置レイヤー */}
          <div
            className="absolute inset-0 pointer-events-none grid"
            style={{gridTemplateColumns: `60px repeat(${totalColumns}, ${columnWidth})`}}
          >
            <div />
            {weekColumns.map((col) => {
              const layout = calculateSeparatedLayout(
                scheduleHooks.filteredSchedules,
                scheduleHooks.filteredExclusions,
                col.teamId,
                col.dateStr
              )

              return (
                <div key={`${col.teamId}-${col.dateStr}-overlay`} className="relative border-r border-gray-200">
                  {/* 除外日 */}
                  {layout.exclusions.map((item: any, idx: number) => {
                    const timeSlot = getExclusionTimeSlot(item.data)
                    return (
                      <div
                        key={`exclusion-${item.data.id}-${idx}`}
                        className="absolute border-2 border-dashed border-red-500 bg-red-50 rounded p-1 overflow-hidden pointer-events-auto cursor-pointer hover:opacity-90"
                        style={{
                          top: calculateTopPosition(timeSlot),
                          height: calculateHeight(timeSlot),
                          width: item.width,
                          left: item.left,
                          zIndex: 10
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          scheduleHooks.handleScheduleDateClick(col.date)
                        }}
                      >
                        <div className="text-[10px] text-red-700 font-medium italic truncate">
                          🚫 {getExclusionTimeText(item.data)}
                        </div>
                        <div className="text-[9px] text-red-600 italic truncate">
                          {item.data.reason}
                        </div>
                      </div>
                    )
                  })}

                  {/* スケジュール */}
                  {layout.schedules.map((item: any, idx: number) => {
                    const bgColorClass = col.color === 'blue' ? 'bg-blue-500' :
                                        col.color === 'green' ? 'bg-green-500' :
                                        col.color === 'purple' ? 'bg-purple-500' : 'bg-gray-500'

                    return (
                      <div
                        key={`schedule-${item.data.customerCode}-${idx}`}
                        className={`absolute ${bgColorClass} text-white rounded p-1 overflow-hidden pointer-events-auto cursor-pointer hover:opacity-90`}
                        style={{
                          top: calculateTopPosition(item.data.timeSlot),
                          height: calculateHeight(item.data.timeSlot),
                          width: item.width,
                          left: item.left,
                          zIndex: 5
                        }}
                        title={`${item.data.customerName} - ${item.data.address}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          scheduleHooks.handleScheduleDateClick(col.date)
                        }}
                      >
                        <div className="text-[10px] font-semibold truncate">
                          {item.data.timeSlot}
                        </div>
                        <div className="text-[9px] truncate">
                          {item.data.customerName}
                        </div>
                        {item.data.workType && (
                          <div className="text-[8px] truncate opacity-90">
                            {item.data.workType}
                          </div>
                        )}
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
  )
}

