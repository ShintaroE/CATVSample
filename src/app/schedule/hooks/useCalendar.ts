import { useState, useCallback } from 'react'
import { ViewMode } from '@/features/calendar/types'

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2025, 8, 15))
  const [selectedDate, setSelectedDate] = useState<string>('2025-09-15')
  const [selectedDateForAdd, setSelectedDateForAdd] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('month')

  const formatDateString = useCallback((date: Date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }, [])

  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
      return newDate
    })
  }, [])

  const navigateDay = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
      const dateStr = formatDateString(newDate)
      setSelectedDate(dateStr)
      return newDate
    })
  }, [formatDateString])

  const handleDateSelect = useCallback((date: Date) => {
    const dateStr = formatDateString(date)
    setSelectedDateForAdd(dateStr)
  }, [formatDateString])

  const handleDateDoubleClick = useCallback((date: Date) => {
    const dateStr = formatDateString(date)
    setSelectedDate(dateStr)
    setCurrentDate(date)
    setViewMode('day')
  }, [formatDateString])

  const clearSelectedDateForAdd = useCallback(() => {
    setSelectedDateForAdd(null)
  }, [])

  return {
    currentDate,
    setCurrentDate,
    selectedDate,
    setSelectedDate,
    selectedDateForAdd,
    setSelectedDateForAdd,
    viewMode,
    setViewMode,
    formatDateString,
    navigateMonth,
    navigateWeek,
    navigateDay,
    handleDateSelect,
    handleDateDoubleClick,
    clearSelectedDateForAdd,
  }
}

