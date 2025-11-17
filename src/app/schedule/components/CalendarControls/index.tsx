'use client'

import React from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { Button } from '@/shared/components/ui'
import { ViewMode } from '../../types'
import NavigationButtons from './NavigationButtons'
import ViewModeSwitcher from './ViewModeSwitcher'
import FilterPanel from './FilterPanel'
import ScheduleTypeFilter from './ScheduleTypeFilter'
import { useFilters } from '../../hooks/useFilters'

interface CalendarControlsProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onNavigateMonth: (direction: 'prev' | 'next') => void
  onNavigateWeek: (direction: 'prev' | 'next') => void
  onNavigateDay: (direction: 'prev' | 'next') => void
  currentDate: Date
  selectedDateForAdd: string | null
  onAddSchedule: () => void
  onClearSelectedDate: () => void
  filterHooks: ReturnType<typeof useFilters>
}

export default function CalendarControls({
  viewMode,
  onViewModeChange,
  onNavigateMonth,
  onNavigateWeek,
  onNavigateDay,
  currentDate,
  selectedDateForAdd,
  onAddSchedule,
  onClearSelectedDate,
  filterHooks,
}: CalendarControlsProps) {

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <NavigationButtons
            viewMode={viewMode}
            onNavigateMonth={onNavigateMonth}
            onNavigateWeek={onNavigateWeek}
            onNavigateDay={onNavigateDay}
            currentDate={currentDate}
          />
          <ViewModeSwitcher
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
          />
          <FilterPanel
            filterHooks={filterHooks}
          />
          <ScheduleTypeFilter
            scheduleTypeFilter={filterHooks.scheduleTypeFilter}
            isOpen={filterHooks.isScheduleTypeFilterOpen}
            onToggle={() => filterHooks.setIsScheduleTypeFilterOpen(!filterHooks.isScheduleTypeFilterOpen)}
            onToggleType={filterHooks.handleToggleScheduleType}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={onAddSchedule}
            variant="primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            {selectedDateForAdd ? (
              <>新規登録 ({new Date(selectedDateForAdd + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })})</>
            ) : (
              '新規登録'
            )}
          </Button>
          {selectedDateForAdd && (
            <Button
              onClick={onClearSelectedDate}
              variant="secondary"
            >
              選択解除
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

