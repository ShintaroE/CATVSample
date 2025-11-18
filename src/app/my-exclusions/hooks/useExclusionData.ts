import { useState, useCallback, useEffect } from 'react'
import { ExclusionEntry } from '@/app/schedule/types'
import { exclusionStorage } from '../lib/exclusionStorage'

/**
 * 除外日データ管理フック
 * 除外日のCRUD操作を提供
 */
export function useExclusionData(contractorId: string) {
  // localStorageから初期化
  const [exclusions, setExclusions] = useState<ExclusionEntry[]>([])

  // 初回読み込み時にlocalStorageからデータを取得
  useEffect(() => {
    const storedExclusions = exclusionStorage.getByContractorId(contractorId)
    setExclusions(storedExclusions)
  }, [contractorId])

  /**
   * 除外日を追加
   */
  const addExclusion = useCallback((exclusion: ExclusionEntry) => {
    exclusionStorage.add(exclusion)
    setExclusions(exclusionStorage.getByContractorId(contractorId))
  }, [contractorId])

  /**
   * 除外日を更新
   */
  const updateExclusion = useCallback((id: string, updates: Partial<ExclusionEntry>) => {
    exclusionStorage.update(id, updates)
    setExclusions(exclusionStorage.getByContractorId(contractorId))
  }, [contractorId])

  /**
   * 除外日を削除
   */
  const deleteExclusion = useCallback((id: string) => {
    exclusionStorage.delete(id)
    setExclusions(exclusionStorage.getByContractorId(contractorId))
  }, [contractorId])

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
   * teamIds が空配列の場合は空配列を返す（何も表示しない）
   */
  const filterByTeams = useCallback(
    (teamIds: string[]) => {
      // 空配列の場合は何も表示しない
      if (teamIds.length === 0) {
        return []
      }
      // 選択された班に含まれるもののみ返す
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
