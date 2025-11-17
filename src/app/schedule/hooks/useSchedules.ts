import { useState, useCallback, useEffect } from 'react'
import { ScheduleItem } from '../types'
import { scheduleStorage } from '../lib/scheduleStorage'
import { sampleSchedules } from '../data/sampleData'

export function useSchedules() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])

  // 初回読み込み時にlocalStorageからデータを取得
  useEffect(() => {
    const storedSchedules = scheduleStorage.getAll()
    if (storedSchedules.length > 0) {
      setSchedules(storedSchedules)
    } else {
      // データがない場合はサンプルデータで初期化
      scheduleStorage.initializeSampleData(sampleSchedules)
      setSchedules(sampleSchedules)
    }
  }, [])

  const addSchedule = useCallback((schedule: ScheduleItem) => {
    scheduleStorage.add(schedule)
    setSchedules(scheduleStorage.getAll())
  }, [])

  const updateSchedule = useCallback((id: string, updates: Partial<ScheduleItem>) => {
    scheduleStorage.update(id, updates)
    setSchedules(scheduleStorage.getAll())
  }, [])

  const deleteSchedule = useCallback((id: string) => {
    scheduleStorage.delete(id)
    setSchedules(scheduleStorage.getAll())
  }, [])

  return {
    schedules,
    setSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
  }
}

