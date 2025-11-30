/**
 * カレンダー関連の型定義
 *
 * このファイルには以下の型が定義されています：
 * - 表示モード（ViewMode, CalendarViewMode）
 * - スケジュール・除外日データ型
 * - フィルター型
 * - ビュー表示用の型
 * - カレンダーピッカー用の型
 */

// ========== 表示モード ==========
export type ViewMode = 'month' | 'week' | 'day'
// CalendarViewModeは後方互換性のため維持
export type CalendarViewMode = ViewMode

// ========== スケジュール種別 ==========
export type ScheduleType = 'construction' | 'survey'

// ========== アサイン班情報 ==========
export interface AssignedTeam {
  contractorId: string
  contractorName: string
  teamId: string
  teamName: string
}

// ========== スケジュールデータ ==========
export interface ScheduleItem {
  id: string
  scheduleType: ScheduleType // 'construction' (工事) | 'survey' (現地調査)
  orderNumber: string
  propertyType?: '個別' | '集合' // 物件種別
  customerCode?: string // 顧客コード（個別の場合）
  customerName: string
  collectiveCode?: string // 集合住宅コード（集合の場合）
  collectiveHousingName?: string // 集合住宅名（集合の場合）
  address: string
  phoneNumber?: string // 電話番号
  contractor: '直営班' | '栄光電気' | 'スライヴ'
  contractorId: string
  teamId?: string
  teamName?: string
  assignedTeams: AssignedTeam[]
  assignedDate: string // 工事日 or 調査日
  timeSlot: string // "09:00-12:00" 形式
  memo?: string
  createdAt?: string
  updatedAt?: string
}

export interface ScheduleItemWithTeam extends ScheduleItem {
  displayTeam: AssignedTeam
}

// ========== 除外日データ ==========
export interface ExclusionEntry {
  id: string
  date: string
  reason: string
  contractor: string
  contractorId: string
  teamId: string
  teamName: string
  timeType: 'all_day' | 'am' | 'pm' | 'custom'
  startTime?: string
  endTime?: string
}

// ========== フィルター ==========
export interface TeamFilter {
  contractorId: string
  contractorName: string
  teamId: string
  teamName: string
  isVisible: boolean
  color: string
}

export interface ScheduleTypeFilter {
  construction: boolean
  survey: boolean
}

// ========== ビュー表示用の型 ==========
export interface WeekViewColumn {
  teamId: string
  teamName: string
  contractorId: string
  contractorName: string
  color: string
  date: Date
  dateStr: string
  displayName: string
  teamDisplayName: string
}

export interface DayColumn {
  date: Date
  dateStr: string
  displayName: string
  dayOfWeek: number
}

export interface TeamColumnInDay {
  day: DayColumn
  team: {
    teamId: string
    teamName: string
    contractorName: string
    contractorId: string
    color: string
    displayName: string
    shortName: string
  }
}

export interface TeamGroup {
  teamId: string
  teamName: string
  contractorName: string
  color: string
  displayName: string
  columnCount: number
}

// ========== カレンダー表示定数 ==========
export const HOUR_HEIGHT = 4
export const BUSINESS_START_HOUR = 9
export const BUSINESS_END_HOUR = 18

// ========== カレンダーピッカー用の型（既存・後方互換性のため維持） ==========

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
