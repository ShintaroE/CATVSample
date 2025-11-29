export interface AssignedTeam {
  contractorId: string
  contractorName: string
  teamId: string
  teamName: string
}

// スケジュール種別
export type ScheduleType = 'construction' | 'survey'

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

export interface TeamFilter {
  contractorId: string
  contractorName: string
  teamId: string
  teamName: string
  isVisible: boolean
  color: string
}

export type ViewMode = 'month' | 'week' | 'day'

export const HOUR_HEIGHT = 4
export const BUSINESS_START_HOUR = 9
export const BUSINESS_END_HOUR = 18
