'use client'

import React, { useMemo } from 'react'
import { ScheduleItem, ExclusionEntry, HOUR_HEIGHT, BUSINESS_START_HOUR, BUSINESS_END_HOUR, WeekViewColumn, TeamGroup, AssignedTeam } from '../../../types'
import { getContractorColorClasses } from '@/shared/utils/contractorColors'
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
  const teamGroups = layoutHooks.getTeamGroups()
  const weekColumns = layoutHooks.getWeekViewColumns()
  const columnWidth = layoutHooks.getColumnWidth(teamGroups.length)
  const totalColumns = weekColumns.length

  const getHourlyTimeSlots = () => {
    const slots: string[] = []
    for (let hour = BUSINESS_START_HOUR; hour <= BUSINESS_END_HOUR; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
    }
    return slots
  }

  // 各列ごとのスケジュールと除外日を取得（早期returnの前に呼ぶ必要がある）
  const columnSchedules = useMemo(() => {
    return weekColumns.map((col: WeekViewColumn) => {
      return filterHooks.filteredSchedules.filter((s: ScheduleItem) =>
        s.assignedDate === col.dateStr &&
        s.assignedTeams.some((team: AssignedTeam) => team.teamId === col.teamId)
      )
    })
  }, [weekColumns, filterHooks.filteredSchedules])

  const columnExclusions = useMemo(() => {
    return weekColumns.map((col: WeekViewColumn) => {
      return filterHooks.filteredExclusions.filter((e: ExclusionEntry) =>
        e.teamId === col.teamId && e.date === col.dateStr
      )
    })
  }, [weekColumns, filterHooks.filteredExclusions])

  if (totalColumns === 0) {
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

  const timeSlots = getHourlyTimeSlots()

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <div style={{ minWidth: `calc(60px + ${totalColumns} * ${columnWidth})` }}>
          <div
            className="grid border-b border-gray-200"
            style={{
              gridTemplateColumns: `60px ${teamGroups.map(() => `repeat(7, ${columnWidth})`).join(' ')}`
            }}
          >
            <div className="p-3 bg-gray-50 border-r-2 border-gray-300 text-sm font-medium text-gray-700 sticky left-0 z-10">
              時間
            </div>
            {teamGroups.map((team: TeamGroup) => (
              <div
                key={team.teamId}
                className={`p-3 text-center border-r-2 border-gray-300 last:border-r-0 ${
                  team.color === 'blue' ? 'bg-blue-50' :
                  team.color === 'green' ? 'bg-green-50' :
                  team.color === 'purple' ? 'bg-purple-50' : 'bg-gray-50'
                }`}
                style={{ gridColumn: `span 7` }}
              >
                <span className="text-sm font-semibold text-gray-900">{team.displayName}</span>
              </div>
            ))}
          </div>

          <div
            className="grid border-b-2 border-gray-300"
            style={{
              gridTemplateColumns: `60px repeat(${totalColumns}, ${columnWidth})`
            }}
          >
            <div className="bg-gray-50 border-r border-gray-200 sticky left-0 z-10" />
            {weekColumns.map((col: WeekViewColumn, idx: number) => (
              <div
                key={`${col.teamId}-${col.dateStr}-${idx}`}
                className={`p-2 text-center text-xs border-r border-gray-200 cursor-pointer hover:bg-gray-100 ${
                  col.dateStr === selectedDateForAdd ? 'bg-blue-200' : 'bg-gray-50'
                }`}
                onClick={() => onDateSelect(col.date)}
                onDoubleClick={() => onDateDoubleClick(col.date)}
              >
                <div className="font-medium text-gray-700">{col.displayName}</div>
              </div>
            ))}
          </div>

          <div className="relative" style={{ height: `${HOUR_HEIGHT * (BUSINESS_END_HOUR - BUSINESS_START_HOUR + 1)}rem` }}>
            {/* グリッド背景 */}
            <div className="grid" style={{ gridTemplateColumns: `60px repeat(${totalColumns}, ${columnWidth})` }}>
              {/* 時間列（背景） */}
              <div className="border-r-2 border-gray-300 bg-gray-50 sticky left-0 z-10">
                {timeSlots.map((time: string) => (
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
              {weekColumns.map((col: WeekViewColumn) => (
                <div key={`grid-${col.teamId}-${col.dateStr}`} className="border-r border-gray-100">
                  {timeSlots.map((time: string) => (
                    <div
                      key={`${col.teamId}-${col.dateStr}-${time}`}
                      className="border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                      style={{
                        height: `${HOUR_HEIGHT}rem`
                      }}
                      onClick={() => onDateSelect(col.date)}
                      onDoubleClick={() => onDateDoubleClick(col.date)}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* スケジュールと除外日の絶対配置レイヤー */}
            <div className="absolute inset-0 pointer-events-none grid" style={{ gridTemplateColumns: `60px repeat(${totalColumns}, ${columnWidth})` }}>
              {/* 時間列のスペーサー */}
              <div />

              {/* 班ごとのスケジュールエリア */}
              {weekColumns.map((col: WeekViewColumn, colIdx: number) => {
                const schedules = columnSchedules[colIdx] || []
                const exclusions = columnExclusions[colIdx] || []

                return (
                  <div key={`schedule-${col.teamId}-${col.dateStr}`} className="relative pointer-events-auto">
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
                          className={`absolute left-0 right-0 rounded border-l-4 shadow-sm cursor-pointer hover:shadow-lg hover:z-50 transition-all ${getContractorColorClasses(schedule.contractor)}`}
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

