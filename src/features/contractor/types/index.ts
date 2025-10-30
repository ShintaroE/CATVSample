/**
 * 協力会社・班関連の型定義
 */

// 管理者の基本情報
export interface Admin {
  id: string
  name: string
  username: string
  password: string
  createdAt: string
  isActive: boolean
}

// 協力会社の基本情報
export interface Contractor {
  id: string
  name: string
  username: string
  password: string
  createdAt: string
  isActive: boolean
}

// 班情報
export interface Team {
  id: string
  contractorId: string
  teamName: string
  members?: string[]
  createdAt: string
  isActive: boolean
}

// 除外日エントリー
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

// スケジュール項目
export interface ScheduleItem {
  id: string
  assignedDate: string
  timeSlot: string
  contractor: string
  contractorId: string
  teamId?: string
  teamName?: string
  status: string
  customerCode?: string
  customerName?: string
  address?: string
  workType?: string
}
