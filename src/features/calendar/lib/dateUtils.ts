/**
 * カレンダー用日付ユーティリティ関数
 */

import { formatDateString } from '@/shared/utils/formatters'

/**
 * 指定月の全日付配列を生成（6週間分）
 * 日曜日から開始
 */
export function getMonthDays(date: Date): Date[] {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay()) // 日曜日から開始

  const days = []
  for (let i = 0; i < 42; i++) { // 6週間分
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)
    days.push(currentDate)
  }
  return days
}

/**
 * 指定日付の週の全日付配列を生成（日曜日〜土曜日）
 */
export function getWeekDays(date: Date): Date[] {
  const dayOfWeek = date.getDay()
  const startDate = new Date(date)
  startDate.setDate(date.getDate() - dayOfWeek) // その週の日曜日

  const days = []
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)
    days.push(currentDate)
  }
  return days
}

/**
 * 月を前後に移動
 */
export function navigateMonth(date: Date, direction: 'prev' | 'next'): Date {
  const newDate = new Date(date)
  newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
  return newDate
}

/**
 * 週を前後に移動
 */
export function navigateWeek(date: Date, direction: 'prev' | 'next'): Date {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
  return newDate
}

/**
 * 日を前後に移動
 */
export function navigateDay(date: Date, direction: 'prev' | 'next'): Date {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
  return newDate
}

/**
 * 今日かどうかをチェック
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

/**
 * 指定された月の日付かどうかをチェック
 */
export function isCurrentMonth(date: Date, currentMonth: Date): boolean {
  return date.getMonth() === currentMonth.getMonth() &&
         date.getFullYear() === currentMonth.getFullYear()
}

/**
 * 2つの日付が同じ日かどうかをチェック
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString()
}

/**
 * 日付文字列（YYYY-MM-DD）と日付オブジェクトが同じ日かチェック
 */
export function isSelectedDate(date: Date, selectedDateStr: string | null): boolean {
  if (!selectedDateStr) return false
  return formatDateString(date) === selectedDateStr
}

/**
 * 月と年の表示形式（例: 2025年10月）
 */
export function formatMonthYear(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

/**
 * 曜日名の配列を取得
 */
export function getWeekdayNames(): string[] {
  return ['日', '月', '火', '水', '木', '金', '土']
}

/**
 * 除外日の時間タイプを表示用テキストに変換
 */
export function getExclusionTimeText(timeType: 'all_day' | 'am' | 'pm' | 'custom', startTime?: string, endTime?: string): string {
  switch (timeType) {
    case 'all_day':
      return '終日'
    case 'am':
      return '午前'
    case 'pm':
      return '午後'
    case 'custom':
      return `${startTime}-${endTime}`
    default:
      return ''
  }
}
