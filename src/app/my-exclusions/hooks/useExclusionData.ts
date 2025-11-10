import { useState, useCallback } from 'react'
import { ExclusionEntry } from '@/app/schedule/types'

/**
 * 除外日データ管理フック
 * 除外日のCRUD操作を提供
 */
export function useExclusionData(contractorId: string) {
  const [exclusions, setExclusions] = useState<ExclusionEntry[]>([])

  /**
   * 除外日を追加
   */
  const addExclusion = useCallback((exclusion: ExclusionEntry) => {
    setExclusions(prev => [...prev, exclusion])
  }, [])

  /**
   * 除外日を更新
   */
  const updateExclusion = useCallback((id: string, updates: Partial<ExclusionEntry>) => {
    setExclusions(prev =>
      prev.map(e => e.id === id ? { ...e, ...updates } : e)
    )
  }, [])

  /**
   * 除外日を削除
   */
  const deleteExclusion = useCallback((id: string) => {
    setExclusions(prev => prev.filter(e => e.id !== id))
  }, [])

  /**
   * 指定された日付の除外日を取得
   */
  const getExclusionsByDate = useCallback(
    (date: string) => {
      return exclusions.filter(e => e.date === date)
    },
    [exclusions]
  )

  /**
   * 指定された日付と班IDで除外日をフィルタリング
   */
  const getExclusionsByDateAndTeams = useCallback(
    (date: string, teamIds: string[]) => {
      if (teamIds.length === 0) {
        return exclusions.filter(e => e.date === date)
      }
      return exclusions.filter(
        e => e.date === date && teamIds.includes(e.teamId)
      )
    },
    [exclusions]
  )

  /**
   * 指定された班IDで除外日をフィルタリング
   */
  const filterByTeams = useCallback(
    (teamIds: string[]) => {
      if (teamIds.length === 0) {
        return exclusions
      }
      return exclusions.filter(e => teamIds.includes(e.teamId))
    },
    [exclusions]
  )

  return {
    exclusions,
    addExclusion,
    updateExclusion,
    deleteExclusion,
    getExclusionsByDate,
    getExclusionsByDateAndTeams,
    filterByTeams,
  }
}
