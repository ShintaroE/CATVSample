'use client'

import React, { useMemo } from 'react'
import { ScheduleItem, ExclusionEntry, HOUR_HEIGHT, BUSINESS_START_HOUR, BUSINESS_END_HOUR, TeamColumnInDay, AssignedTeam } from '../../../types'
import { getContractorColorClasses } from '@/shared/utils/contractorColors'
import { getScheduleIcon } from '../../../lib/scheduleUtils'
import { useFilters } from '../../../hooks/useFilters'
import { useScheduleLayout } from '../../../hooks/useScheduleLayout'
import { useCalendar } from '../../../hooks/useCalendar'

interface WeekViewProps {
  currentDate: Date
  selectedDateForAdd: string | null
  onDateSelect: (date: Date) => void
  onDateDoubleClick: (date: Date) => void
  onEditSchedule: (schedule: ScheduleItem) => void
  filterHooks: ReturnType<typeof useFilters>
  layoutHooks: ReturnType<typeof useScheduleLayout>
  calendarHooks: ReturnType<typeof useCalendar>
}

export default function WeekView({
  selectedDateForAdd,
  onDateSelect,
  onDateDoubleClick,
  onEditSchedule,
  filterHooks,
  layoutHooks,
}: WeekViewProps) {
  // 日付軸ビュー用のデータ取得
  const dayColumns = layoutHooks.getWeekDayColumns()
  const teamColumns = layoutHooks.getWeekColumnsByDate()
  const visibleTeamsCount = filterHooks.teamFilters.filter(f => f.isVisible).length
  const teamColumnWidth = layoutHooks.getTeamColumnWidth(visibleTeamsCount)

  const getHourlyTimeSlots = () => {
    const slots: string[] = []
    for (let hour = BUSINESS_START_HOUR; hour <= BUSINESS_END_HOUR; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
    }
    return slots
  }

  // 各列ごとのスケジュールと除外日を取得
  const columnSchedules = useMemo(() => {
    return teamColumns.map((col: TeamColumnInDay) => {
      return filterHooks.filteredSchedules.filter((s: ScheduleItem) =>
        s.assignedDate === col.day.dateStr &&
        s.assignedTeams.some((team: AssignedTeam) => team.teamId === col.team.teamId)
      )
    })
  }, [teamColumns, filterHooks.filteredSchedules])

  const columnExclusions = useMemo(() => {
    return teamColumns.map((col: TeamColumnInDay) => {
      return filterHooks.filteredExclusions.filter((e: ExclusionEntry) =>
        e.teamId === col.team.teamId && e.date === col.day.dateStr
      )
    })
  }, [teamColumns, filterHooks.filteredExclusions])

  if (visibleTeamsCount === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
        フィルターで全ての班が非表示になっています。
        <br />
        表示フィルターから班を選択してください。
      </div>
    )
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

  const timeSlots = getHourlyTimeSlots()

  // グリッドテンプレートカラムを計算: 時間列(60px) + 7日分 × 各日のチーム数
  const totalColumns = 7 * visibleTeamsCount
  const gridTemplateColumns = `60px repeat(${totalColumns}, ${teamColumnWidth})`
  const minWidthCalc = `calc(60px + ${totalColumns} * ${teamColumnWidth})`

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-scroll">
        <div style={{ minWidth: minWidthCalc }}>
          {/* ヘッダー第1行: 日付 */}
          <div
            className="grid border-b border-gray-200"
            style={{ gridTemplateColumns }}
          >
            <div className="p-3 bg-gray-50 border-r-2 border-gray-300 text-sm font-medium text-gray-700 sticky left-0 z-20">
              時間
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
          <div
            className="grid border-b-2 border-gray-300"
            style={{ gridTemplateColumns }}
          >
            <div className="bg-gray-50 border-r-2 border-gray-300 sticky left-0 z-20" />
            {teamColumns.map((col: TeamColumnInDay, idx: number) => {
              const isDateBoundary = (idx + 1) % visibleTeamsCount === 0
              return (
                <div
                  key={`${col.day.dateStr}-${col.team.teamId}`}
                  className={`p-2 text-center text-xs flex flex-col items-center justify-center h-16 cursor-pointer hover:bg-gray-100 ${
                    col.day.dateStr === selectedDateForAdd ? 'bg-blue-200' : 'bg-white'
                  } ${
                    isDateBoundary ? 'border-r-2 border-gray-300' : 'border-r border-gray-200'
                  }`}
                  onClick={() => onDateSelect(col.day.date)}
                  onDoubleClick={() => onDateDoubleClick(col.day.date)}
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

          {/* メイングリッド: 時間 × 班列 */}
          <div className="relative" style={{ height: `${HOUR_HEIGHT * (BUSINESS_END_HOUR - BUSINESS_START_HOUR + 1)}rem` }}>
            {/* グリッド背景 */}
            <div className="grid" style={{ gridTemplateColumns }}>
              {/* 時間列（背景） */}
              <div className="border-r-2 border-gray-300 bg-gray-50 sticky left-0 z-20">
                {timeSlots.map((time: string) => (
                  <div
                    key={time}
                    className="border-b border-gray-100 flex items-start justify-center p-1"
                    style={{ height: `${HOUR_HEIGHT}rem` }}
                  >
                    <span className="text-xs text-gray-600 font-medium">{time}</span>
                  </div>
                ))}
              </div>

              {/* 班列（背景グリッド） */}
              {teamColumns.map((col: TeamColumnInDay, idx: number) => {
                const isDateBoundary = (idx + 1) % visibleTeamsCount === 0
                const isWeekend = col.day.dayOfWeek === 0 || col.day.dayOfWeek === 6
                return (
                  <div
                    key={`grid-${col.day.dateStr}-${col.team.teamId}`}
                    className={`${
                      isDateBoundary ? 'border-r-2 border-gray-300' : 'border-r border-gray-100'
                    } ${isWeekend ? 'bg-red-50/30' : ''}`}
                  >
                    {timeSlots.map((time: string) => (
                      <div
                        key={`${col.day.dateStr}-${col.team.teamId}-${time}`}
                        className="border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                        style={{ height: `${HOUR_HEIGHT}rem` }}
                        onClick={() => onDateSelect(col.day.date)}
                        onDoubleClick={() => onDateDoubleClick(col.day.date)}
                      />
                    ))}
                  </div>
                )
              })}
            </div>

            {/* スケジュールと除外日の絶対配置レイヤー */}
            <div className="absolute inset-0 pointer-events-none grid" style={{ gridTemplateColumns }}>
              {/* 時間列のスペーサー */}
              <div />

              {/* 班ごとのスケジュールエリア */}
              {teamColumns.map((col: TeamColumnInDay, colIdx: number) => {
                const schedules = columnSchedules[colIdx] || []
                const exclusions = columnExclusions[colIdx] || []

                return (
                  <div key={`schedule-${col.day.dateStr}-${col.team.teamId}`} className="relative pointer-events-auto">
                    {/* 除外日バー */}
                    {exclusions.map((exclusion: ExclusionEntry, index: number) => (
                      <div
                        key={`exclusion-${exclusion.id}`}
                        className="absolute left-0 right-0 bg-red-50 border-2 border-dashed border-red-500 p-1 shadow-sm cursor-default hover:shadow-md transition-shadow"
                        style={{
                          top: layoutHooks.calculateExclusionTop(exclusion),
                          height: layoutHooks.calculateExclusionHeight(exclusion),
                          zIndex: 10 + index
                        }}
                        title={`除外日: ${getTimeLabel(exclusion)} - ${exclusion.reason}`}
                      >
                        <div className="text-xs text-red-700 font-bold flex items-center justify-center space-x-1">
                          <span>🚫</span>
                          <span>{getTimeLabel(exclusion)}</span>
                        </div>
                        <div className="text-xs text-red-600 italic truncate text-center mt-1">
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
                          className={`absolute left-0 right-0 rounded border-l-4 shadow-sm cursor-pointer hover:shadow-lg hover:z-50 transition-all ${getContractorColorClasses(schedule.contractor)}`}
                          style={{
                            top: layoutHooks.calculateScheduleTop(schedule.timeSlot),
                            height: scheduleHeight,
                            zIndex: 1 + index
                          }}
                          onClick={() => onEditSchedule(schedule)}
                        >
                          <div className="p-1 h-full overflow-hidden">
                            <div className="text-xs font-bold truncate flex items-center gap-1">
                              <span>{getScheduleIcon(schedule.scheduleType)}</span>
                              <span>{schedule.customerName}</span>
                            </div>
                            {heightValue > 2 && (
                              <div className="text-xs opacity-90 truncate">{schedule.timeSlot}</div>
                            )}
                            {heightValue > 4 && (
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
