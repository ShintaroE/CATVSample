import { ScheduleItem, ExclusionEntry } from '@/app/schedule/types'

interface CalendarItemProps {
  type: 'schedule' | 'exclusion'
  item: ScheduleItem | ExclusionEntry
}

/**
 * テキストを指定文字数で切り詰める
 */
function truncateName(name: string, maxLength: number = 8): string {
  return name.length > maxLength ? name.slice(0, maxLength) + '...' : name
}

/**
 * 除外日の時間帯ラベルを取得
 */
function getTimeLabel(exclusion: ExclusionEntry): string {
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

/**
 * カレンダーセル内の個別アイテム（スケジュールまたは除外日）
 */
export default function CalendarItem({ type, item }: CalendarItemProps) {
  if (type === 'schedule') {
    const schedule = item as ScheduleItem
    return (
      <div className="bg-blue-50 border-l-4 border-blue-500 px-2 py-1 mb-1 rounded-r text-xs hover:bg-blue-100 transition-colors">
        <div className="flex items-center gap-1">
          <span>🔧</span>
          <span className="font-medium text-blue-700">{schedule.timeSlot}</span>
        </div>
        <div className="text-gray-700 truncate">
          {schedule.teamName} {truncateName(schedule.customerName, 8)}
        </div>
      </div>
    )
  } else {
    const exclusion = item as ExclusionEntry
    return (
      <div className="bg-red-50 border-l-4 border-red-500 border-dashed px-2 py-1 mb-1 rounded-r text-xs hover:bg-red-100 transition-colors">
        <div className="flex items-center gap-1">
          <span>🚫</span>
          <span className="font-medium text-red-700">{getTimeLabel(exclusion)}</span>
        </div>
        <div className="text-gray-700 truncate">
          {exclusion.teamName} {truncateName(exclusion.reason, 8)}
        </div>
      </div>
    )
  }
}
