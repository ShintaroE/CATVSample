import { ExclusionEntry } from '@/app/schedule/types'
import { STORAGE_KEYS } from '@/shared/utils/constants'

const STORAGE_KEY = STORAGE_KEYS.EXCLUSIONS

/**
 * 除外日データのlocalStorage操作
 */
export const exclusionStorage = {
  /**
   * すべての除外日を取得
   */
  getAll(): ExclusionEntry[] {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to load exclusions:', error)
      return []
    }
  },

  /**
   * 除外日を保存
   */
  saveAll(exclusions: ExclusionEntry[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(exclusions))
    } catch (error) {
      console.error('Failed to save exclusions:', error)
    }
  },

  /**
   * 除外日を追加
   */
  add(exclusion: ExclusionEntry): void {
    const exclusions = this.getAll()
    exclusions.push(exclusion)
    this.saveAll(exclusions)
  },

  /**
   * 除外日を更新
   */
  update(id: string, updates: Partial<ExclusionEntry>): void {
    const exclusions = this.getAll()
    const index = exclusions.findIndex(e => e.id === id)
    if (index !== -1) {
      exclusions[index] = { ...exclusions[index], ...updates }
      this.saveAll(exclusions)
    }
  },

  /**
   * 除外日を削除
   */
  delete(id: string): void {
    const exclusions = this.getAll().filter(e => e.id !== id)
    this.saveAll(exclusions)
  },

  /**
   * 協力会社IDで除外日を取得
   */
  getByContractorId(contractorId: string): ExclusionEntry[] {
    return this.getAll().filter(e => e.contractorId === contractorId)
  },

  /**
   * 班IDで除外日を取得
   */
  getByTeamId(teamId: string): ExclusionEntry[] {
    return this.getAll().filter(e => e.teamId === teamId)
  },

  /**
   * 特定の日付の除外日を取得
   */
  getByDate(date: string): ExclusionEntry[] {
    return this.getAll().filter(e => e.date === date)
  },

  /**
   * 日付範囲で除外日を取得
   */
  getByDateRange(startDate: string, endDate: string): ExclusionEntry[] {
    return this.getAll().filter(e =>
      e.date >= startDate && e.date <= endDate
    )
  },

  /**
   * 初期データ設定（開発用）
   */
  initializeSampleData(sampleData: ExclusionEntry[]): void {
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

/**
 * デフォルトの除外日データ
 */
const defaultExclusions: ExclusionEntry[] = [
  {
    id: 'excl-1',
    date: '2025-01-15',
    reason: '他現場対応',
    contractor: '直営班',
    contractorId: 'contractor-1',
    teamId: 'team-1',
    teamName: 'A班',
    timeType: 'all_day',
  },
  {
    id: 'excl-2',
    date: '2025-01-20',
    reason: '休暇',
    contractor: '栄光電気通信',
    contractorId: 'contractor-2',
    teamId: 'team-3',
    teamName: '1班',
    timeType: 'pm',
  },
  {
    id: 'excl-3',
    date: '2025-01-22',
    reason: '定期メンテナンス',
    contractor: '直営班',
    contractorId: 'contractor-1',
    teamId: 'team-2',
    teamName: 'B班',
    timeType: 'am',
  },
]

/**
 * 初期化関数（AuthProviderから呼び出される）
 */
export function initializeExclusionData(): void {
  if (exclusionStorage.getAll().length === 0) {
    exclusionStorage.saveAll(defaultExclusions)
  }
}
