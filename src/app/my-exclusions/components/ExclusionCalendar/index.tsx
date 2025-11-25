import { useMemo } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { ScheduleItem, ExclusionEntry } from '@/app/schedule/types'
import DateCell from './DateCell'
import { formatDateString } from '@/shared/utils/formatters'

interface ExclusionCalendarProps {
  currentMonth: Date
  schedules: ScheduleItem[]
  exclusions: ExclusionEntry[]
  selectedDate: string | null
  onDateClick: (date: string) => void
  onMonthChange: (direction: 'prev' | 'next') => void
}

/**
 * 月の全日付を取得（前月・次月の日付も含む）
 */
function getMonthDates(date: Date): Date[] {
  const year = date.getFullYear()
  const month = date.getMonth()

  // 月の最初の日と最後の日
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // カレンダーの最初の日（前月の日付も含む）
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  // カレンダーの最後の日（次月の日付も含む）
  const endDate = new Date(lastDay)
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))

  const dates: Date[] = []
  const current = new Date(startDate)

  while (current <= endDate) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

/**
 * 除外日管理画面用のカレンダーコンポーネント
 * スケジュールと除外日を表示
 */
export default function ExclusionCalendar({
  currentMonth,
  schedules,
  exclusions,
  selectedDate,
  onDateClick,
  onMonthChange
}: ExclusionCalendarProps) {
  const dates = useMemo(() => getMonthDates(currentMonth), [currentMonth])
  const today = formatDateString(new Date())

  // 日付ごとのアイテムをグループ化
  const itemsByDate = useMemo(() => {
    const map = new Map<string, Array<{ type: 'schedule' | 'exclusion', data: ScheduleItem | ExclusionEntry }>>()

    // スケジュールを追加
    schedules.forEach(schedule => {
      const dateStr = schedule.assignedDate
      if (!map.has(dateStr)) {
        map.set(dateStr, [])
      }
      map.get(dateStr)!.push({ type: 'schedule', data: schedule })
    })

    // 除外日を追加
    exclusions.forEach(exclusion => {
      const dateStr = exclusion.date
      if (!map.has(dateStr)) {
        map.set(dateStr, [])
      }
      map.get(dateStr)!.push({ type: 'exclusion', data: exclusion })
    })

    return map
  }, [schedules, exclusions])

  const weekDays = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="bg-white rounded-lg shadow">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={() => onMonthChange('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          aria-label="前月"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-gray-900">
          {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
        </h2>

        <button
          onClick={() => onMonthChange('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          aria-label="次月"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {weekDays.map((day, idx) => (
          <div
            key={day}
            className={`p-2 text-center text-sm font-semibold ${idx === 0 ? 'text-red-600' : idx === 6 ? 'text-blue-600' : 'text-gray-700'
              }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7">
        {dates.map((date, idx) => {
          const dateStr = formatDateString(date)
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
          const isToday = dateStr === today
          const isSelected = dateStr === selectedDate
          const items = itemsByDate.get(dateStr) || []

          return (
            <DateCell
              key={idx}
              date={date}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              isSelected={isSelected}
              items={items}
              onClick={onDateClick}
            />
          )
        })}
      </div>
    </div>
  )
}
