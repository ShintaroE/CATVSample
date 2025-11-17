'use client'

import React from 'react'
import { ScheduleItem, ExclusionEntry, ScheduleItemWithTeam } from '../../../types'
import { getContractorColorClasses } from '@/shared/utils/contractorColors'
import { getScheduleIcon } from '../../../lib/scheduleUtils'
import { useFilters } from '../../../hooks/useFilters'
import { useScheduleLayout } from '../../../hooks/useScheduleLayout'
import { useCalendar } from '../../../hooks/useCalendar'

interface MonthViewProps {
  currentDate: Date
  selectedDateForAdd: string | null
  onDateSelect: (date: Date) => void
  onDateDoubleClick: (date: Date) => void
  onEditSchedule: (schedule: ScheduleItem) => void
  filterHooks: ReturnType<typeof useFilters>
  layoutHooks: ReturnType<typeof useScheduleLayout>
  calendarHooks: ReturnType<typeof useCalendar>
}

export default function MonthView({
  currentDate,
  selectedDateForAdd,
  onDateSelect,
  onDateDoubleClick,
  onEditSchedule,
  filterHooks,
  calendarHooks,
}: MonthViewProps) {
  // ローディング状態のチェック
  if (filterHooks.isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
        読み込み中...
      </div>
    )
  }

  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }
    return days
  }

  const getSchedulesForDate = (date: Date) => {
    const dateStr = calendarHooks.formatDateString(date)
    return filterHooks.filteredSchedules.filter((s: ScheduleItem) => s.assignedDate === dateStr)
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

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const monthDays = getMonthDays()

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 gap-0 border-b border-gray-200">
        {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
          <div
            key={day}
            className={`p-3 text-center text-sm font-medium ${
              index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
            } bg-gray-50 border-r border-gray-200 last:border-r-0`}
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0">
        {monthDays.map((date, index) => {
          const dateStr = calendarHooks.formatDateString(date)
          const daySchedulesRaw = getSchedulesForDate(date)
          const daySchedules = filterHooks.expandSchedulesByTeams(daySchedulesRaw)
          const dayExclusions = filterHooks.filteredExclusions.filter((ex: ExclusionEntry) => ex.date === dateStr)

          return (
            <div
              key={index}
              className={`min-h-32 p-2 border-r border-b border-gray-200 last:border-r-0 cursor-pointer hover:bg-gray-50 ${
                !isCurrentMonth(date) ? 'bg-gray-50' : 'bg-white'
              } ${dateStr === selectedDateForAdd ? 'bg-blue-100 ring-2 ring-blue-500' : ''} ${
                isToday(date) ? 'ring-2 ring-green-400' : ''
              }`}
              onClick={() => onDateSelect(date)}
              onDoubleClick={() => onDateDoubleClick(date)}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  !isCurrentMonth(date) ? 'text-gray-400' :
                  isToday(date) ? 'text-blue-600' : 'text-gray-900'
                }`}
              >
                {date.getDate()}
              </div>
              <div className="space-y-1">
                {dayExclusions.map((exclusion: ExclusionEntry) => (
                  <div
                    key={exclusion.id}
                    className="text-xs p-1 rounded border-2 border-dashed border-red-400 bg-red-50"
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-red-700 font-bold">🚫</span>
                      <span className="font-medium text-red-800 truncate">
                        {exclusion.contractor} - {exclusion.teamName}
                      </span>
                    </div>
                    <div className="text-[10px] text-red-700 truncate">{getTimeLabel(exclusion)}</div>
                  </div>
                ))}

                {daySchedules.slice(0, dayExclusions.length > 0 ? 2 : 3).map((schedule: ScheduleItemWithTeam, idx: number) => (
                  <div
                    key={`${schedule.id}-${schedule.displayTeam?.teamId || idx}`}
                    className={`text-xs p-1 rounded truncate cursor-pointer ${getContractorColorClasses(schedule.displayTeam?.contractorName || schedule.contractor)}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditSchedule(schedule)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{schedule.timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{getScheduleIcon(schedule.scheduleType)}</span>
                      <span className="truncate">{schedule.customerName}</span>
                    </div>
                  </div>
                ))}
                {daySchedules.length > (dayExclusions.length > 0 ? 2 : 3) && (
                  <div className="text-xs text-gray-500 text-center">
                    +{daySchedules.length - (dayExclusions.length > 0 ? 2 : 3)}件
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

