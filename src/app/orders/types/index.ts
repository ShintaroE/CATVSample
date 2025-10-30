export interface AppointmentHistory {
  id: string
  date: string
  endTime?: string
  status: '工事決定' | '保留' | '不通'
  content: string
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

export interface TeamGroup {
  teamId: string
  teamName: string
  contractorName: string
  color: string
  displayName: string
  columnCount: number
}

export interface TeamFilter {
  contractorId: string
  contractorName: string
  teamId: string
  teamName: string
  isVisible: boolean
  color: string
}

export type CalendarViewMode = 'month' | 'week'

export interface ScheduleData {
  assignedDate: string
  timeSlot: string
  contractor: string
  contractorId: string
  teamId: string
  teamName: string
  assignedTeams?: Array<{
    teamId: string
    teamName: string
    contractorId: string
    contractorName: string
  }>
  status: string
  customerCode: string
  customerName: string
  address: string
  workType: string
}

export interface OrderData {
  orderNumber: string
  orderSource: string
  workContent: string
  customerCode: string
  customerType: '新規' | '既存'
  customerName: string
  constructionDate?: string
  closureNumber?: string
  address?: string
  phoneNumber?: string
  surveyStatus?: 'pending' | 'in_progress' | 'completed'
  permissionStatus?: 'pending' | 'in_progress' | 'completed'
  constructionStatus?: 'pending' | 'in_progress' | 'completed'
  mapPdfPath?: string
  appointmentHistory?: AppointmentHistory[]
}

export const workContentOptions = [
  '個別対応',
  'HCNAー技術人工事',
  'G・6ch追加人工事',
  '放送波人工事'
]
