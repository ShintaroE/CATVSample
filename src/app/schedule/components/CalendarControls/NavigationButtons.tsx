'use client'

import React from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { ViewMode } from '../../types'

interface NavigationButtonsProps {
  viewMode: ViewMode
  onNavigateMonth: (direction: 'prev' | 'next') => void
  onNavigateWeek: (direction: 'prev' | 'next') => void
  onNavigateDay: (direction: 'prev' | 'next') => void
  currentDate: Date
}

export default function NavigationButtons({
  viewMode,
  onNavigateMonth,
  onNavigateWeek,
  onNavigateDay,
  currentDate,
}: NavigationButtonsProps) {
  const formatMonthYear = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`
  }

  const getWeekRangeLabel = (): string => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    const startMonth = startOfWeek.getMonth() + 1
    const startDay = startOfWeek.getDate()
    const endMonth = endOfWeek.getMonth() + 1
    const endDay = endOfWeek.getDate()
    const year = startOfWeek.getFullYear()

    if (startMonth === endMonth) {
      return `${year}年${startMonth}月${startDay}日 - ${endDay}日`
    }
    return `${year}年${startMonth}月${startDay}日 - ${endMonth}月${endDay}日`
  }

  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ['日', '月', '火', '水', '木', '金', '土']
    const weekday = weekdays[date.getDay()]
    return `${month}/${day}(${weekday})`
  }

  const getDisplayLabel = () => {
    switch (viewMode) {
      case 'month':
        return formatMonthYear(currentDate)
      case 'week':
        return getWeekRangeLabel()
      case 'day':
        return formatDate(currentDate)
      default:
        return formatMonthYear(currentDate)
    }
  }

  const handlePrev = () => {
    switch (viewMode) {
      case 'month':
        onNavigateMonth('prev')
        break
      case 'week':
        onNavigateWeek('prev')
        break
      case 'day':
        onNavigateDay('prev')
        break
    }
  }

  const handleNext = () => {
    switch (viewMode) {
      case 'month':
        onNavigateMonth('next')
        break
      case 'week':
        onNavigateWeek('next')
        break
      case 'day':
        onNavigateDay('next')
        break
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handlePrev}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        aria-label="前へ"
      >
        <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
      </button>
      <h2 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
        {getDisplayLabel()}
      </h2>
      <button
        onClick={handleNext}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        aria-label="次へ"
      >
        <ChevronRightIcon className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  )
}

