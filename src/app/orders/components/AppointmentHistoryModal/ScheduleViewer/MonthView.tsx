'use client'

import React from 'react'
import { useScheduleViewer } from '../../../hooks/useScheduleViewer'
import { getContractorBadgeColorClasses, getContractorBackgroundColorClass, getContractorColorName } from '@/lib/contractorColors'
import { getScheduleIcon } from '@/app/schedule/lib/scheduleUtils'

interface MonthViewProps {
  scheduleHooks: ReturnType<typeof useScheduleViewer>
}

export default function MonthView({ scheduleHooks }: MonthViewProps) {
  const getExclusionTimeText = (exclusion: { timeType: string; startTime?: string; endTime?: string }) => {
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

  const today = new Date()
  const firstDay = new Date(
    scheduleHooks.scheduleCalendarDate.getFullYear(),
    scheduleHooks.scheduleCalendarDate.getMonth(),
    1
  )
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    days.push(date)
  }

  return (
    <>
      <div className="bg-white border rounded-lg overflow-hidden mb-3">
        <div className="grid grid-cols-7 gap-0 border-b border-gray-200">
          {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
            <div
              key={day}
              className={`p-2 text-center text-xs font-medium ${
                index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
              } bg-gray-50 border-r border-gray-200 last:border-r-0`}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0">
          {days.map((date, index) => {
            const dateStr = date.toISOString().slice(0, 10)
            const daySchedules = scheduleHooks.filteredSchedules.filter(
              schedule => schedule.assignedDate === dateStr
            )
            const dayExclusions = scheduleHooks.filteredExclusions.filter(
              exclusion => exclusion.date === dateStr
            )
            const isCurrentMonth = date.getMonth() === scheduleHooks.scheduleCalendarDate.getMonth()
            const isToday = date.toDateString() === today.toDateString()

            return (
              <div
                key={index}
                className={`min-h-20 p-1 border-r border-b border-gray-200 last:border-r-0 cursor-pointer hover:bg-blue-50 ${
                  !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                } ${scheduleHooks.selectedScheduleDate === dateStr ? 'bg-blue-100 border-blue-300' : ''} ${
                  isToday ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => scheduleHooks.handleScheduleDateClick(date)}
              >
                <div
                  className={`text-xs font-medium mb-1 ${
                    !isCurrentMonth ? 'text-gray-400' :
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}
                >
                  {date.getDate()}
                </div>

                {/* スケジュール詳細表示 */}
                <div className="space-y-0.5">
                  {daySchedules.slice(0, 2).map((schedule, idx) => (
                    <div
                      key={idx}
                      className={`text-[10px] p-0.5 rounded truncate ${getContractorBadgeColorClasses(schedule.contractor)}`}
                    >
                      <div className="truncate flex items-center gap-0.5">
                        <span>{getScheduleIcon(schedule.scheduleType)}</span>
                        <span>{schedule.contractor}{schedule.teamName ? ` - ${schedule.teamName}` : ''}</span>
                      </div>
                    </div>
                  ))}

                  {/* 除外日表示 */}
                  {dayExclusions.slice(0, 2 - Math.min(daySchedules.length, 2)).map((exclusion, idx) => (
                    <div
                      key={`exclusion-${idx}`}
                      className="text-[10px] p-0.5 rounded truncate bg-red-50 border border-red-200"
                    >
                      <div className="truncate text-red-700 font-medium">
                        🚫 {exclusion.contractor} - {exclusion.teamName}
                      </div>
                    </div>
                  ))}

                  {(daySchedules.length + dayExclusions.length) > 2 && (
                    <div className="text-[10px] text-gray-500 text-center">
                      +{(daySchedules.length + dayExclusions.length) - 2}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 説明文 */}
      <div className="p-2 bg-blue-50 rounded-md mb-3">
        <div className="text-xs text-blue-800">
          <p>📅 日付をクリックして詳細スケジュールを確認できます</p>
        </div>
      </div>

      {/* 選択日の詳細スケジュール表示 */}
      {scheduleHooks.selectedScheduleDate && (
        <div className="border-t pt-3 mt-3">
          <h5 className="text-sm font-medium text-gray-900 mb-2">
            📅 {scheduleHooks.selectedScheduleDate} の詳細スケジュール
          </h5>
          <div className="space-y-2">
            {scheduleHooks.filteredSchedules
              .filter(schedule => schedule.assignedDate === scheduleHooks.selectedScheduleDate)
              .map((schedule, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getContractorBackgroundColorClass(schedule.contractor)} ${
                    getContractorColorName(schedule.contractor) === 'blue' ? 'border-blue-200' :
                    getContractorColorName(schedule.contractor) === 'green' ? 'border-green-200' :
                    getContractorColorName(schedule.contractor) === 'purple' ? 'border-purple-200' :
                    'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-xs">{schedule.timeSlot}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${getContractorBadgeColorClasses(schedule.contractor)}`}>
                      {schedule.contractor}{schedule.teamName ? ` - ${schedule.teamName}` : ''}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {schedule.customerName && (
                      <div className="text-[10px] text-gray-700">
                        <span className="font-medium">名前:</span> {schedule.customerName}
                      </div>
                    )}
                    {schedule.address && (
                      <div className="text-[10px] text-gray-600">
                        <span className="font-medium">場所:</span> {schedule.address}
                      </div>
                    )}
                    {schedule.orderNumber && (
                      <div className="text-[10px] text-gray-600">
                        <span className="font-medium">オーダー:</span> {schedule.orderNumber}
                      </div>
                    )}
                  </div>
                </div>
              ))}

            {/* 除外日の詳細表示 */}
            {scheduleHooks.filteredExclusions
              .filter(exclusion => exclusion.date === scheduleHooks.selectedScheduleDate)
              .map((exclusion, index) => (
                <div
                  key={`exclusion-detail-${index}`}
                  className="p-3 rounded-lg border-2 border-dashed border-red-300 bg-red-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-xs text-red-700">
                      🚫 {getExclusionTimeText(exclusion)}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                      {exclusion.contractor} - {exclusion.teamName}
                    </span>
                  </div>
                  <div className="text-[10px] text-red-600 italic">
                    除外理由: {exclusion.reason}
                  </div>
                </div>
              ))}

            {scheduleHooks.filteredSchedules.filter(schedule => schedule.assignedDate === scheduleHooks.selectedScheduleDate).length === 0 &&
             scheduleHooks.filteredExclusions.filter(exclusion => exclusion.date === scheduleHooks.selectedScheduleDate).length === 0 && (
              <div className="text-center py-3">
                <p className="text-xs text-gray-500">✅ この日は予定がありません</p>
                <p className="text-[10px] text-gray-400 mt-1">アポイント設定に最適です</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

