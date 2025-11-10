import clsx from 'clsx'
import { ScheduleItem, ExclusionEntry } from '@/app/schedule/types'
import CalendarItem from './CalendarItem'
import { formatDateString } from '@/shared/utils/formatters'

interface CalendarItemData {
  type: 'schedule' | 'exclusion'
  data: ScheduleItem | ExclusionEntry
}

interface DateCellProps {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  items: CalendarItemData[]
  onClick: (date: string) => void
}

const MAX_VISIBLE_ITEMS = 4

/**
 * カレンダーの日付セル
 * スケジュールと除外日を表示し、クリックで詳細表示
 */
export default function DateCell({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  items,
  onClick
}: DateCellProps) {
  const visibleItems = items.slice(0, MAX_VISIBLE_ITEMS)
  const remainingCount = items.length - MAX_VISIBLE_ITEMS

  const handleClick = () => {
    onClick(formatDateString(date))
  }

  return (
    <div
      className={clsx(
        'min-h-[120px] border border-gray-200 p-2 cursor-pointer transition-colors',
        'hover:bg-gray-50',
        !isCurrentMonth && 'bg-gray-100 opacity-50',
        isToday && 'ring-2 ring-green-400',
        isSelected && 'bg-blue-100 ring-2 ring-blue-500'
      )}
      onClick={handleClick}
    >
      {/* 日付ヘッダー */}
      <div
        className={clsx(
          'text-sm font-semibold mb-2',
          isToday && 'text-green-600',
          isSelected && 'text-blue-600',
          !isCurrentMonth && 'text-gray-400'
        )}
      >
        {date.getDate()}
      </div>

      {/* アイテム表示 */}
      <div className="space-y-1">
        {visibleItems.map((item, idx) => (
          <CalendarItem key={idx} type={item.type} item={item.data} />
        ))}

        {/* オーバーフロー表示 */}
        {remainingCount > 0 && (
          <div className="text-xs text-gray-600 text-center py-1 bg-gray-100 rounded font-medium">
            +{remainingCount}件
          </div>
        )}
      </div>
    </div>
  )
}
