import { ScheduleType } from '../types'

/**
 * スケジュール種別に対応するアイコンを取得
 */
export function getScheduleIcon(scheduleType: ScheduleType): string {
  switch (scheduleType) {
    case 'construction':
      return '🔧' // 工事
    case 'survey':
      return '📋' // 現地調査
    default:
      return ''
  }
}

/**
 * スケジュール種別の表示名を取得
 */
export function getScheduleTypeLabel(scheduleType: ScheduleType): string {
  switch (scheduleType) {
    case 'construction':
      return '工事'
    case 'survey':
      return '現地調査'
    default:
      return ''
  }
}
