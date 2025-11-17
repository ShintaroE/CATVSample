'use client'

import React, { useState } from 'react'
import Layout from '@/shared/components/layout/Layout'
import { ScheduleItem, ExclusionEntry } from './types'
import { sampleExclusions } from './data/sampleData'
import { useSchedules } from './hooks/useSchedules'
import { useCalendar } from './hooks/useCalendar'
import { useFilters } from './hooks/useFilters'
import { useScheduleLayout } from './hooks/useScheduleLayout'
import CalendarControls from './components/CalendarControls'
import MonthView from './components/CalendarViews/MonthView'
import WeekView from './components/CalendarViews/WeekView'
import DayView from './components/CalendarViews/DayView'
import EditScheduleModal from './components/ScheduleModals/EditScheduleModal'
import AddScheduleModal from './components/ScheduleModals/AddScheduleModal'

export default function SchedulePage() {
  const { schedules, addSchedule, updateSchedule, deleteSchedule } = useSchedules()
  const [exclusions] = useState<ExclusionEntry[]>(sampleExclusions)
  const calendarHooks = useCalendar()
  const filterHooks = useFilters(schedules, exclusions)
  const layoutHooks = useScheduleLayout(
    filterHooks.teamFilters,
    calendarHooks.currentDate,
    calendarHooks.formatDateString,
    (date: Date) => {
      const month = date.getMonth() + 1
      const day = date.getDate()
      const weekdays = ['日', '月', '火', '水', '木', '金', '土']
      const weekday = weekdays[date.getDay()]
      return `${month}/${day}(${weekday})`
    }
  )

  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const handleAddSchedule = () => {
    setShowAddModal(true)
  }

  const handleEditSchedule = (schedule: ScheduleItem) => {
    setEditingSchedule(schedule)
    setShowEditModal(true)
  }

  const handleSaveSchedule = (schedule: ScheduleItem) => {
    if (schedule.id) {
      updateSchedule(schedule.id, schedule)
    } else {
      addSchedule({ ...schedule, id: String(Date.now()) })
    }
    setShowEditModal(false)
    setShowAddModal(false)
    setEditingSchedule(null)
  }

  const handleDeleteSchedule = (id: string) => {
    deleteSchedule(id)
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">
                工事日程管理
              </h1>
              <div className="text-sm text-gray-600">
                宅内引込工事日程表
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <CalendarControls
            viewMode={calendarHooks.viewMode}
            onViewModeChange={calendarHooks.setViewMode}
            onNavigateMonth={calendarHooks.navigateMonth}
            onNavigateWeek={calendarHooks.navigateWeek}
            onNavigateDay={calendarHooks.navigateDay}
            currentDate={calendarHooks.currentDate}
            selectedDateForAdd={calendarHooks.selectedDateForAdd}
            onAddSchedule={handleAddSchedule}
            onClearSelectedDate={calendarHooks.clearSelectedDateForAdd}
            filterHooks={filterHooks}
          />

          {calendarHooks.viewMode === 'month' && (
            <MonthView
              currentDate={calendarHooks.currentDate}
              selectedDateForAdd={calendarHooks.selectedDateForAdd}
              onDateSelect={calendarHooks.handleDateSelect}
              onDateDoubleClick={calendarHooks.handleDateDoubleClick}
              onEditSchedule={handleEditSchedule}
              filterHooks={filterHooks}
              layoutHooks={layoutHooks}
              calendarHooks={calendarHooks}
            />
          )}

          {calendarHooks.viewMode === 'week' && (
            <WeekView
              currentDate={calendarHooks.currentDate}
              selectedDateForAdd={calendarHooks.selectedDateForAdd}
              onDateSelect={calendarHooks.handleDateSelect}
              onDateDoubleClick={calendarHooks.handleDateDoubleClick}
              onEditSchedule={handleEditSchedule}
              filterHooks={filterHooks}
              layoutHooks={layoutHooks}
              calendarHooks={calendarHooks}
            />
          )}

          {calendarHooks.viewMode === 'day' && (
            <DayView
              selectedDate={calendarHooks.selectedDate}
              onEditSchedule={handleEditSchedule}
              filterHooks={filterHooks}
              layoutHooks={layoutHooks}
              calendarHooks={calendarHooks}
            />
          )}

          {showEditModal && editingSchedule && (
            <EditScheduleModal
              schedule={editingSchedule}
              onSave={handleSaveSchedule}
              onDelete={handleDeleteSchedule}
              onClose={() => {
                setShowEditModal(false)
                setEditingSchedule(null)
              }}
            />
          )}

          {showAddModal && (
            <AddScheduleModal
              selectedDate={calendarHooks.selectedDateForAdd || calendarHooks.selectedDate}
              onSave={handleSaveSchedule}
              onClose={() => {
                setShowAddModal(false)
                calendarHooks.clearSelectedDateForAdd()
              }}
            />
          )}
        </main>
      </div>
    </Layout>
  )
}
