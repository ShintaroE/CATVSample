/**
 * カレンダー関連の型定義
 */

// カレンダー表示モード
export type CalendarViewMode = 'month' | 'week' | 'day'

// スケジュール項目（カレンダー表示用）
export interface CalendarScheduleItem {
  assignedDate: string
  timeSlot: string
  contractor: string
  status: string
  customerName?: string
  address?: string
  workType?: string
}

// 除外日エントリー（カレンダー表示用）
export interface CalendarExclusionEntry {
  id: string
  date: string
  reason: string
  contractor: string
  contractorId?: string
  teamId?: string
  teamName?: string
  timeType: 'all_day' | 'am' | 'pm' | 'custom'
  startTime?: string
  endTime?: string
}

// カレンダーピッカーのProps
export interface CalendarPickerProps {
  selectedDate?: string
  onDateSelect: (date: string) => void
  onClose: () => void
  existingSchedules?: CalendarScheduleItem[]
  exclusions?: CalendarExclusionEntry[]
}

// 日付情報
export interface DateInfo {
  date: Date
  dateString: string
  isToday: boolean
  isSelected: boolean
  isCurrentMonth: boolean
  schedules: CalendarScheduleItem[]
  exclusions: CalendarExclusionEntry[]
}
