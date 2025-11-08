export interface AppointmentHistory {
  id: string
  date: string
  endTime?: string
  status: '工事決定' | '保留' | '不通' | '留守電'
  content: string
  // 工事決定時の追加情報
  scheduleInfo?: {
    contractorId: string
    contractorName: string
    teamId: string
    teamName: string
    workStartTime: string  // 工事開始時刻 (HH:MM)
    workEndTime: string    // 工事終了時刻 (HH:MM)
  }
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

export type ConstructionCategory = '個別' | '集合'

export type IndividualWorkType = '個別' | 'マンションタイプ光工事' | 'Gドット'
export type CollectiveWorkType = 'HCNA一括導入工事' | 'G.fast導入工事' | '放送導入工事'

export interface OrderData {
  orderNumber: string
  orderSource: string
  constructionCategory: ConstructionCategory
  workType: IndividualWorkType | CollectiveWorkType
  apartmentCode?: string
  apartmentName?: string
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

export const individualWorkTypeOptions: IndividualWorkType[] = [
  '個別',
  'マンションタイプ光工事',
  'Gドット'
]

export const collectiveWorkTypeOptions: CollectiveWorkType[] = [
  'HCNA一括導入工事',
  'G.fast導入工事',
  '放送導入工事'
]

export function getWorkTypeOptions(category: ConstructionCategory) {
  return category === '個別'
    ? individualWorkTypeOptions
    : collectiveWorkTypeOptions
}
