export interface AssignedTeam {
  contractorId: string
  contractorName: string
  teamId: string
  teamName: string
}

export interface ScheduleItem {
  id: string
  orderNumber: string
  customerName: string
  address: string
  workType: string
  contractor: '直営班' | '栄光電気' | 'スライヴ'
  contractorId: string
  teamId?: string
  teamName?: string
  assignedTeams: AssignedTeam[]
  assignedDate: string
  timeSlot: string
  status: '予定' | '作業中' | '完了' | '延期'
  memo?: string
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
export type ScheduleStatus = '予定' | '作業中' | '完了' | '延期'

export const STATUSES: readonly ScheduleStatus[] = ['予定', '作業中', '完了', '延期'] as const

export const HOUR_HEIGHT = 4
export const BUSINESS_START_HOUR = 9
export const BUSINESS_END_HOUR = 18
