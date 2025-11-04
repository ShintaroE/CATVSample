import { useState, useCallback } from 'react'
import { ScheduleItem } from '../types'
import { sampleSchedules } from '../data/sampleData'

export function useSchedules(initialSchedules: ScheduleItem[] = sampleSchedules) {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialSchedules)

  const addSchedule = useCallback((schedule: ScheduleItem) => {
    setSchedules(prev => [...prev, schedule])
  }, [])

  const updateSchedule = useCallback((id: string, updates: Partial<ScheduleItem>) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }, [])

  const deleteSchedule = useCallback((id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id))
  }, [])

  return {
    schedules,
    setSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
  }
}

