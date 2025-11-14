'use client'

import React from 'react'
import { useScheduleViewer } from '../../../hooks/useScheduleViewer'
import { getContractorSolidColorClass } from '@/shared/utils/contractorColors'
import { ExclusionEntry, ScheduleData, TeamColumnInDay } from '../../../types'

interface WeekViewProps {
  scheduleHooks: ReturnType<typeof useScheduleViewer>
}

export default function WeekView({ scheduleHooks }: WeekViewProps) {
  const getExclusionTimeText = (exclusion: ExclusionEntry) => {
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

  const getExclusionTimeSlot = (exclusion: ExclusionEntry): string => {
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

  const getColorDotClass = (color: string): string => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500'
      case 'green':
        return 'bg-green-500'
      case 'purple':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  interface LayoutItem {
    data: ExclusionEntry | ScheduleData
    width: string
    left: string
  }

  const calculateSeparatedLayout = (schedules: ScheduleData[], exclusions: ExclusionEntry[], teamId: string, dateStr: string): { exclusions: LayoutItem[]; schedules: LayoutItem[] } => {
    const daySchedules = schedules.filter(s =>
      s.assignedDate === dateStr &&
      s.assignedTeams?.some(t => t.teamId === teamId)
    )
    const dayExclusions = exclusions.filter(e =>
      e.date === dateStr && e.teamId === teamId
    )

    if (dayExclusions.length > 0 && daySchedules.length > 0) {
      return {
        exclusions: dayExclusions.map((e: ExclusionEntry) => ({
          data: e,
          width: '50%',
          left: '0%'
        })),
        schedules: daySchedules.map((s: ScheduleData) => ({
          data: s,
          width: '50%',
          left: '50%'
        }))
      }
    }

    return {
      exclusions: dayExclusions.map((e: ExclusionEntry) => ({
        data: e,
        width: '100%',
        left: '0%'
      })),
      schedules: daySchedules.map((s: ScheduleData) => ({
        data: s,
        width: '100%',
        left: '0%'
      }))
    }
  }

  // 日付軸ビュー用のデータ取得
  const dayColumns = scheduleHooks.getWeekDayColumns()
  const teamColumns = scheduleHooks.getWeekColumnsByDate()
  const visibleTeamsCount = scheduleHooks.teamFilters.filter(f => f.isVisible).length
  const teamColumnWidth = scheduleHooks.getTeamColumnWidth(visibleTeamsCount)

  // グリッド計算
  const totalColumns = 7 * visibleTeamsCount
  const gridTemplateColumns = `60px repeat(${totalColumns}, ${teamColumnWidth})`
  const minWidthCalc = `calc(60px + ${totalColumns} * ${teamColumnWidth})`

  if (visibleTeamsCount === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        フィルターで班を選択してください
      </div>
    )
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-scroll">
          <div style={{ minWidth: minWidthCalc }}>
            {/* ヘッダー第1行: 日付 */}
            <div className="grid border-b border-gray-200" style={{ gridTemplateColumns }}>
              <div className="p-3 bg-gray-50 border-r-2 border-gray-300 text-sm font-medium text-gray-700 sticky left-0 z-20">
                時刻
              </div>
              {dayColumns.map((day) => {
                const isWeekend = day.dayOfWeek === 0 || day.dayOfWeek === 6
                return (
                  <div
                    key={day.dateStr}
                    className={`p-3 text-center border-r-2 border-gray-300 last:border-r-0 ${
                      isWeekend ? 'bg-red-50' : 'bg-white'
                    }`}
                    style={{ gridColumn: `span ${visibleTeamsCount}` }}
                  >
                    <span className="text-sm font-semibold text-gray-900">{day.displayName}</span>
                  </div>
                )
              })}
            </div>

            {/* ヘッダー第2行: 班名 */}
            <div className="grid border-b-2 border-gray-300" style={{ gridTemplateColumns }}>
              <div className="bg-gray-50 border-r-2 border-gray-300 sticky left-0 z-20" />
              {teamColumns.map((col: TeamColumnInDay, idx: number) => {
                const isDateBoundary = (idx + 1) % visibleTeamsCount === 0
                return (
                  <div
                    key={`${col.day.dateStr}-${col.team.teamId}`}
                    className={`p-2 text-center text-xs flex flex-col items-center justify-center h-16 bg-white ${
                      isDateBoundary ? 'border-r-2 border-gray-300' : 'border-r border-gray-200'
                    }`}
                  >
                    {/* 1行目: 点 + 協力会社名 */}
                    <div className="flex items-center space-x-1 mb-0.5">
                      <div className={`w-2 h-2 rounded-full ${getColorDotClass(col.team.color)}`} />
                      <span className="font-semibold text-gray-700 truncate">
                        {col.team.contractorName}
                      </span>
                    </div>

                    {/* 2行目: 班名 */}
                    <span className="text-xs text-gray-500 truncate">
                      {col.team.teamName}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* タイムグリッド */}
            <div className="relative">
              {/* 背景: 時間行 */}
              {getHourlyTimeSlots().map((hour) => (
                <div
                  key={hour}
                  className="grid border-b border-gray-100"
                  style={{ gridTemplateColumns, height: '4rem' }}
                >
                  {/* 時刻セル */}
                  <div className="bg-gray-50 text-center text-xs text-gray-600 py-1 border-r-2 border-gray-300 flex items-start justify-center sticky left-0 z-10">
                    {hour}
                  </div>
                  {/* 空の列セル */}
                  {teamColumns.map((col: TeamColumnInDay, idx: number) => {
                    const isDateBoundary = (idx + 1) % visibleTeamsCount === 0
                    const isWeekend = col.day.dayOfWeek === 0 || col.day.dayOfWeek === 6
                    return (
                      <div
                        key={`${col.day.dateStr}-${col.team.teamId}-${hour}`}
                        className={`${
                          isDateBoundary ? 'border-r-2 border-gray-300' : 'border-r border-gray-200'
                        } ${isWeekend ? 'bg-red-50/30' : ''}`}
                      />
                    )
                  })}
                </div>
              ))}

              {/* 前景: スケジュールと除外日の絶対配置レイヤー */}
              <div
                className="absolute inset-0 pointer-events-none grid"
                style={{ gridTemplateColumns }}
              >
                <div />
                {teamColumns.map((col: TeamColumnInDay) => {
                  const layout = calculateSeparatedLayout(
                    scheduleHooks.filteredSchedules,
                    scheduleHooks.filteredExclusions,
                    col.team.teamId,
                    col.day.dateStr
                  )

                  return (
                    <div key={`${col.day.dateStr}-${col.team.teamId}-overlay`} className="relative">
                      {/* 除外日 */}
                      {layout.exclusions.map((item: LayoutItem, idx: number) => {
                        const exclusionData = item.data as ExclusionEntry
                        const timeSlot = getExclusionTimeSlot(exclusionData)
                        return (
                          <div
                            key={`exclusion-${exclusionData.id}-${idx}`}
                            className="absolute border-2 border-dashed border-red-500 bg-red-50 rounded p-1 overflow-hidden pointer-events-auto cursor-pointer hover:opacity-90"
                            style={{
                              top: calculateTopPosition(timeSlot),
                              height: calculateHeight(timeSlot),
                              width: item.width,
                              left: item.left,
                              zIndex: 10 + idx
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              scheduleHooks.handleScheduleDateClick(col.day.date)
                            }}
                          >
                            <div className="text-[10px] text-red-700 font-medium italic truncate">
                              🚫 {getExclusionTimeText(exclusionData)}
                            </div>
                            <div className="text-[9px] text-red-600 italic truncate">
                              {exclusionData.reason}
                            </div>
                          </div>
                        )
                      })}

                      {/* スケジュール */}
                      {layout.schedules.map((item: LayoutItem, idx: number) => {
                        const scheduleData = item.data as ScheduleData
                        const contractorName = scheduleData.contractor || ''
                        const bgColorClass = getContractorSolidColorClass(contractorName)

                        return (
                          <div
                            key={`schedule-${scheduleData.customerCode}-${idx}`}
                            className={`absolute ${bgColorClass} text-white rounded p-1 overflow-hidden pointer-events-auto cursor-pointer hover:opacity-90`}
                            style={{
                              top: calculateTopPosition(scheduleData.timeSlot),
                              height: calculateHeight(scheduleData.timeSlot),
                              width: item.width,
                              left: item.left,
                              zIndex: 5 + idx
                            }}
                            title={`${scheduleData.customerName} - ${scheduleData.address}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              scheduleHooks.handleScheduleDateClick(col.day.date)
                            }}
                          >
                            <div className="text-[10px] font-semibold truncate">
                              {scheduleData.timeSlot}
                            </div>
                            <div className="text-[9px] truncate">
                              {scheduleData.customerName}
                            </div>
                            {scheduleData.workType && (
                              <div className="text-[8px] truncate opacity-90">
                                {scheduleData.workType}
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
      </div>

      {/* 説明文 */}
      <div className="p-2 bg-blue-50 rounded-md mb-3 mt-3">
        <div className="text-xs text-blue-800">
          <p>📅 スケジュールまたは除外日をクリックして詳細を確認できます</p>
        </div>
      </div>

      {/* 選択日の詳細スケジュール表示 */}
      {scheduleHooks.selectedScheduleDate && (
        <div className="border-t pt-3 mt-3">
          <h5 className="text-sm font-medium text-gray-900 mb-2">
            📅 {scheduleHooks.selectedScheduleDate} の詳細スケジュール
          </h5>
          <div className="space-y-2">
            {scheduleHooks.filteredSchedules
              .filter(schedule => schedule.assignedDate === scheduleHooks.selectedScheduleDate)
              .map((schedule, index) => {
                const contractorName = schedule.contractor || ''
                const bgColorClass = getContractorSolidColorClass(contractorName)

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${bgColorClass.replace('bg-', 'border-').replace('-500', '-200')} ${bgColorClass.replace('-500', '-50')}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-xs text-gray-900">{schedule.timeSlot}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${bgColorClass} text-white`}>
                        {schedule.contractor}{schedule.assignedTeams?.[0]?.teamName ? ` - ${schedule.assignedTeams[0].teamName}` : ''}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {schedule.customerCode && (
                        <div className="text-[10px] text-gray-700">
                          <span className="font-medium">顧客コード:</span> {schedule.customerCode}
                        </div>
                      )}
                      {schedule.customerName && (
                        <div className="text-[10px] text-gray-700">
                          <span className="font-medium">名前:</span> {schedule.customerName}
                        </div>
                      )}
                      {schedule.address && (
                        <div className="text-[10px] text-gray-600">
                          <span className="font-medium">場所:</span> {schedule.address}
                        </div>
                      )}
                      {schedule.workType && (
                        <div className="text-[10px] text-gray-600">
                          <span className="font-medium">工事内容:</span> {schedule.workType}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

            {/* 除外日の詳細表示 */}
            {scheduleHooks.filteredExclusions
              .filter(exclusion => exclusion.date === scheduleHooks.selectedScheduleDate)
              .map((exclusion, index) => (
                <div
                  key={`exclusion-detail-${index}`}
                  className="p-3 rounded-lg border-2 border-dashed border-red-300 bg-red-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-xs text-red-700">
                      🚫 {getExclusionTimeText(exclusion)}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                      {exclusion.contractor} - {exclusion.teamName}
                    </span>
                  </div>
                  <div className="text-[10px] text-red-600 italic">
                    除外理由: {exclusion.reason}
                  </div>
                </div>
              ))}

            {scheduleHooks.filteredSchedules.filter(schedule => schedule.assignedDate === scheduleHooks.selectedScheduleDate).length === 0 &&
             scheduleHooks.filteredExclusions.filter(exclusion => exclusion.date === scheduleHooks.selectedScheduleDate).length === 0 && (
              <div className="text-center py-3">
                <p className="text-xs text-gray-500">✅ この日は予定がありません</p>
                <p className="text-[10px] text-gray-400 mt-1">アポイント設定に最適です</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
