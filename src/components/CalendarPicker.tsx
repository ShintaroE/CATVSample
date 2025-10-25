'use client'

import React, { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'

interface ExclusionEntry {
  id: string
  date: string
  reason: string
  contractor: string
  timeType: 'all_day' | 'am' | 'pm' | 'custom'
  startTime?: string
  endTime?: string
}

interface CalendarPickerProps {
  selectedDate?: string
  onDateSelect: (date: string) => void
  onClose: () => void
  existingSchedules?: Array<{
    assignedDate: string
    timeSlot: string
    contractor: string
    status: string
    customerName?: string
    address?: string
    workType?: string
  }>
  exclusions?: ExclusionEntry[]
}

export default function CalendarPicker({
  selectedDate,
  onDateSelect,
  onClose,
  existingSchedules = [],
  exclusions = []
}: CalendarPickerProps) {
  const [currentDate, setCurrentDate] = useState<Date>(
    selectedDate ? new Date(selectedDate) : new Date()
  )
  const [internalSelectedDate, setInternalSelectedDate] = useState<string | null>(selectedDate || null)

  // 月表示用の日付配列を生成
  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // 日曜日から開始

    const days = []
    for (let i = 0; i < 42; i++) { // 6週間分
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }
    return days
  }

  // カレンダーナビゲーション
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  // 日付をYYYY-MM-DD形式の文字列に変換
  const formatDateString = (date: Date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 除外日の時間タイプを表示用テキストに変換
  const getExclusionTimeText = (exclusion: ExclusionEntry) => {
    switch (exclusion.timeType) {
      case 'all_day':
        return '終日'
      case 'am':
        return '午前'
      case 'pm':
        return '午後'
      case 'custom':
        return `${exclusion.startTime}-${exclusion.endTime}`
      default:
        return ''
    }
  }

  // 日付をクリックした時の処理
  const handleDateClick = (date: Date) => {
    const dateStr = formatDateString(date)
    setInternalSelectedDate(dateStr)
  }

  // 最終確定時の処理
  const handleConfirmSelection = () => {
    if (internalSelectedDate) {
      onDateSelect(internalSelectedDate)
      onClose()
    }
  }

  const formatMonthYear = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return date.toISOString().slice(0, 10) === internalSelectedDate
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <CalendarDaysIcon className="h-5 w-5 mr-2" />
            アポイント日程選択
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">閉じる</span>
            ✕
          </button>
        </div>

        {/* カレンダーナビゲーション */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <h4 className="text-xl font-semibold text-gray-900">
            {formatMonthYear(currentDate)}
          </h4>
          <button
            onClick={() => navigateDate('next')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* 月表示カレンダー */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 gap-0 border-b border-gray-200">
            {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
              <div key={day} className={`p-3 text-center text-sm font-medium ${
                index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
              } bg-gray-50 border-r border-gray-200 last:border-r-0`}>
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0">
            {getMonthDays().map((date, index) => {
              const dateStr = formatDateString(date)
              const daySchedules = existingSchedules.filter(schedule => schedule.assignedDate === dateStr)
              const dayExclusions = exclusions.filter(exclusion => exclusion.date === dateStr)
              return (
                <div
                  key={index}
                  className={`min-h-24 p-2 border-r border-b border-gray-200 last:border-r-0 cursor-pointer hover:bg-blue-50 ${
                    !isCurrentMonth(date) ? 'bg-gray-50' : 'bg-white'
                  } ${isSelected(date) ? 'bg-blue-100 border-blue-300' : ''} ${
                    isToday(date) ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleDateClick(date)}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    !isCurrentMonth(date) ? 'text-gray-400' :
                    isToday(date) ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {date.getDate()}
                  </div>

                  {/* スケジュール詳細表示 */}
                  <div className="space-y-1">
                    {daySchedules.slice(0, 2).map((schedule, idx) => (
                      <div
                        key={idx}
                        className={`text-xs p-1 rounded truncate ${
                          schedule.contractor === '直営班' ? 'bg-blue-100 text-blue-800' :
                          schedule.contractor === '栄光電気' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}
                      >
                        <div className="font-medium">{schedule.timeSlot}</div>
                        <div className="truncate">{schedule.contractor}</div>
                      </div>
                    ))}

                    {/* 除外日表示 */}
                    {dayExclusions.slice(0, 2 - Math.min(daySchedules.length, 2)).map((exclusion, idx) => (
                      <div
                        key={`exclusion-${idx}`}
                        className="text-xs p-1 rounded truncate bg-red-50 border border-red-200"
                      >
                        <div className="font-medium text-red-700">🚫 {getExclusionTimeText(exclusion)}</div>
                        <div className="truncate text-red-600">{exclusion.contractor}</div>
                      </div>
                    ))}

                    {(daySchedules.length + dayExclusions.length) > 2 && (
                      <div className="text-xs text-gray-500 text-center font-medium">
                        +{(daySchedules.length + dayExclusions.length) - 2}件
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 説明文 */}
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <div className="text-sm text-blue-800">
            <p>📅 日付をクリックしてアポイント日を選択してください</p>
            <p>🔴 数字は既存の工事予定数を表示しています</p>
          </div>
        </div>

        {/* 選択日の詳細スケジュール表示 */}
        {internalSelectedDate && (
          <div className="mt-4 border-t pt-4">
            <h5 className="text-sm font-medium text-gray-900 mb-3">
              📅 {internalSelectedDate} の詳細スケジュール
            </h5>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {existingSchedules
                .filter(schedule => schedule.assignedDate === internalSelectedDate)
                .map((schedule, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${
                    schedule.contractor === '直営班' ? 'bg-blue-50 border-blue-200' :
                    schedule.contractor === '栄光電気' ? 'bg-green-50 border-green-200' :
                    'bg-purple-50 border-purple-200'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">{schedule.timeSlot}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        schedule.contractor === '直営班' ? 'bg-blue-100 text-blue-800' :
                        schedule.contractor === '栄光電気' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {schedule.contractor}
                      </span>
                    </div>
                    {schedule.customerName && (
                      <div className="text-xs text-gray-700 mb-1">
                        👤 {schedule.customerName}
                      </div>
                    )}
                    {schedule.address && (
                      <div className="text-xs text-gray-600 mb-1">
                        📍 {schedule.address}
                      </div>
                    )}
                    {schedule.workType && (
                      <div className="text-xs text-gray-600">
                        🔧 {schedule.workType}
                      </div>
                    )}
                  </div>
                ))}

              {/* 除外日の詳細表示 */}
              {exclusions
                .filter(exclusion => exclusion.date === internalSelectedDate)
                .map((exclusion, index) => (
                  <div key={`exclusion-detail-${index}`} className="p-3 rounded-lg border-2 border-dashed border-red-300 bg-red-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm text-red-700">🚫 {getExclusionTimeText(exclusion)}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                        {exclusion.contractor}
                      </span>
                    </div>
                    <div className="text-xs text-red-600 italic">
                      除外理由: {exclusion.reason}
                    </div>
                  </div>
                ))}

              {existingSchedules.filter(schedule => schedule.assignedDate === internalSelectedDate).length === 0 &&
               exclusions.filter(exclusion => exclusion.date === internalSelectedDate).length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">✅ この日は予定がありません</p>
                  <p className="text-xs text-gray-400 mt-1">アポイント設定に最適です</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            キャンセル
          </button>
          {internalSelectedDate && (
            <button
              onClick={handleConfirmSelection}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              この日に決定
            </button>
          )}
        </div>
      </div>
    </div>
  )
}