import { useState, useEffect, useCallback, useMemo } from 'react'
import { ScheduleItem } from '@/app/schedule/types'
import { sampleSchedules } from '../data/sampleSchedules'

/**
 * スケジュールデータ管理フック
 * 指定された協力会社のスケジュールを管理
 */
export function useScheduleData(contractorId: string) {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])

  // contractorIdが変更されたらスケジュールをフィルタリング
  useEffect(() => {
    if (!contractorId) {
      setSchedules([])
      return
    }

    const filtered = sampleSchedules.filter(
      s => s.contractorId === contractorId
    )
    setSchedules(filtered)
  }, [contractorId])

  /**
   * 指定された日付のスケジュールを取得
   */
  const getSchedulesByDate = useCallback(
    (date: string) => {
      return schedules.filter(s => s.assignedDate === date)
    },
    [schedules]
  )

  /**
   * 指定された日付と班IDでスケジュールをフィルタリング
   */
  const getSchedulesByDateAndTeams = useCallback(
    (date: string, teamIds: string[]) => {
      if (teamIds.length === 0) {
        return schedules.filter(s => s.assignedDate === date)
      }
      return schedules.filter(
        s => s.assignedDate === date && s.teamId && teamIds.includes(s.teamId)
      )
    },
    [schedules]
  )

  /**
   * 指定された班IDでスケジュールをフィルタリング
   * teamIds が空配列の場合は空配列を返す（何も表示しない）
   */
  const filterByTeams = useCallback(
    (teamIds: string[]) => {
      // 空配列の場合は何も表示しない
      if (teamIds.length === 0) {
        return []
      }
      // teamIdが存在し、選択された班に含まれるもののみ返す
      return schedules.filter(s => s.teamId && teamIds.includes(s.teamId))
    },
    [schedules]
  )

  return {
    schedules,
    getSchedulesByDate,
    getSchedulesByDateAndTeams,
    filterByTeams,
  }
}
