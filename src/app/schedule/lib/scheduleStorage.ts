import { ScheduleItem } from '../types'

const STORAGE_KEY = 'schedules'

export const scheduleStorage = {
  /**
   * すべてのスケジュールを取得
   */
  getAll(): ScheduleItem[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  },

  /**
   * スケジュールを保存
   */
  saveAll(schedules: ScheduleItem[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules))
  },

  /**
   * スケジュールを追加
   */
  add(schedule: ScheduleItem): void {
    const schedules = this.getAll()
    const newSchedule = {
      ...schedule,
      createdAt: schedule.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    schedules.push(newSchedule)
    this.saveAll(schedules)
  },

  /**
   * スケジュールを更新
   */
  update(id: string, updates: Partial<ScheduleItem>): void {
    const schedules = this.getAll()
    const index = schedules.findIndex(s => s.id === id)
    if (index !== -1) {
      schedules[index] = {
        ...schedules[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      this.saveAll(schedules)
    }
  },

  /**
   * スケジュールを削除
   */
  delete(id: string): void {
    const schedules = this.getAll().filter(s => s.id !== id)
    this.saveAll(schedules)
  },

  /**
   * 工事のみ取得
   */
  getConstructions(): ScheduleItem[] {
    return this.getAll().filter(s => s.scheduleType === 'construction')
  },

  /**
   * 現地調査のみ取得
   */
  getSurveys(): ScheduleItem[] {
    return this.getAll().filter(s => s.scheduleType === 'survey')
  },

  /**
   * 日付範囲で取得
   */
  getByDateRange(startDate: string, endDate: string): ScheduleItem[] {
    return this.getAll().filter(s =>
      s.assignedDate >= startDate && s.assignedDate <= endDate
    )
  },

  /**
   * 特定の日付のスケジュールを取得
   */
  getByDate(date: string): ScheduleItem[] {
    return this.getAll().filter(s => s.assignedDate === date)
  },

  /**
   * 初期データ設定（開発用）
   */
  initializeSampleData(sampleData: ScheduleItem[]): void {
    if (this.getAll().length === 0) {
      this.saveAll(sampleData)
    }
  },

  /**
   * データをクリア（開発用）
   */
  clear(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  }
}
