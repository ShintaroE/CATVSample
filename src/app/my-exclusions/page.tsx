'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

interface ExclusionEntry {
  id: string
  date: string // YYYY-MM-DD
  reason: string
  contractor: string
  timeType: 'all_day' | 'am' | 'pm' | 'custom' // 終日、午前、午後、カスタム
  startTime?: string // HH:mm
  endTime?: string // HH:mm
}

// サンプルデータ
const initialExclusions: ExclusionEntry[] = [
  {
    id: '1',
    date: '2025-10-10',
    reason: '社員研修',
    contractor: '栄光電気通信',
    timeType: 'all_day',
  },
  {
    id: '2',
    date: '2025-10-11',
    reason: '社員研修',
    contractor: '栄光電気通信',
    timeType: 'am',
  },
  {
    id: '3',
    date: '2025-10-20',
    reason: '定期メンテナンス',
    contractor: 'スライヴ',
    timeType: 'custom',
    startTime: '13:00',
    endTime: '17:00',
  },
]

export default function MyExclusionsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [exclusions, setExclusions] = useState<ExclusionEntry[]>(initialExclusions)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month'>('month')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newReason, setNewReason] = useState('')
  const [newTimeType, setNewTimeType] = useState<'all_day' | 'am' | 'pm' | 'custom'>('all_day')
  const [newStartTime, setNewStartTime] = useState('09:00')
  const [newEndTime, setNewEndTime] = useState('18:00')

  // 認証チェック - useEffect内で実行
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login')
      return
    }

    // 協力会社ユーザーのみアクセス可能
    if (user.role !== 'contractor') {
      router.push('/')
    }
  }, [isAuthenticated, user, router])

  // ローディング中またはアクセス権限なしの場合は何も表示しない
  if (!isAuthenticated || !user || user.role !== 'contractor') {
    return null
  }

  // 自分の協力会社の除外日のみフィルター
  const myExclusions = exclusions.filter((ex) => ex.contractor === user.contractor)

  // カレンダーの日付配列を生成
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }
    return days
  }, [currentMonth])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr)
  }

  const handleAddExclusion = () => {
    if (!selectedDate || !newReason.trim()) {
      alert('日付を選択して理由を入力してください')
      return
    }

    if (newTimeType === 'custom') {
      if (!newStartTime || !newEndTime) {
        alert('開始時刻と終了時刻を入力してください')
        return
      }
      if (newStartTime >= newEndTime) {
        alert('終了時刻は開始時刻より後に設定してください')
        return
      }
    }

    const newExclusion: ExclusionEntry = {
      id: String(Date.now()),
      date: selectedDate,
      reason: newReason,
      contractor: user.contractor,
      timeType: newTimeType,
      ...(newTimeType === 'custom' && {
        startTime: newStartTime,
        endTime: newEndTime,
      }),
    }

    setExclusions((prev) => [...prev, newExclusion])
    setShowAddModal(false)
    setNewReason('')
    setNewTimeType('all_day')
    setNewStartTime('09:00')
    setNewEndTime('18:00')
    setSelectedDate(null)
  }

  const getTimeLabel = (entry: ExclusionEntry): string => {
    switch (entry.timeType) {
      case 'all_day':
        return '終日'
      case 'am':
        return '午前'
      case 'pm':
        return '午後'
      case 'custom':
        return `${entry.startTime} - ${entry.endTime}`
      default:
        return '終日'
    }
  }

  const handleDeleteExclusion = (id: string) => {
    if (confirm('この除外日を削除しますか？')) {
      setExclusions((prev) => prev.filter((ex) => ex.id !== id))
    }
  }

  const selectedDateExclusions = selectedDate
    ? myExclusions.filter((ex) => ex.date === selectedDate)
    : []

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">除外日管理</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {user.contractor} - 工事不可日の登録
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                除外日を追加
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* カレンダービュー */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* カレンダーヘッダー */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 rounded hover:bg-gray-200"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
              </h2>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 rounded hover:bg-gray-200"
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 gap-0 border-b border-gray-200">
              {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                <div
                  key={day}
                  className={`p-3 text-center text-sm font-medium ${
                    index === 0
                      ? 'text-red-600'
                      : index === 6
                      ? 'text-blue-600'
                      : 'text-gray-700'
                  } bg-gray-50 border-r border-gray-200 last:border-r-0`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* カレンダー本体 */}
            <div className="grid grid-cols-7 gap-0">
              {calendarDays.map((date, index) => {
                const dateStr = date.toISOString().split('T')[0]
                const dayExclusions = myExclusions.filter((ex) => ex.date === dateStr)
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
                const isToday = date.toDateString() === new Date().toDateString()
                const isSelected = selectedDate === dateStr

                return (
                  <div
                    key={index}
                    className={`min-h-28 p-2 border-r border-b border-gray-200 last:border-r-0 cursor-pointer hover:bg-blue-50 ${
                      !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                    } ${isSelected ? 'bg-blue-100 ring-2 ring-blue-500' : ''} ${
                      isToday ? 'font-bold' : ''
                    }`}
                    onClick={() => handleDateClick(dateStr)}
                  >
                    <div
                      className={`text-sm mb-2 ${
                        !isCurrentMonth
                          ? 'text-gray-400'
                          : isToday
                          ? 'text-blue-600'
                          : 'text-gray-900'
                      }`}
                    >
                      {date.getDate()}
                    </div>

                    {/* 除外日表示 */}
                    <div className="space-y-1">
                      {dayExclusions.map((exclusion) => (
                        <div
                          key={exclusion.id}
                          className="text-xs p-1 rounded bg-red-100 text-red-800"
                        >
                          <div className="font-medium truncate">{getTimeLabel(exclusion)}</div>
                          <div className="text-[10px] truncate">{exclusion.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 選択日の詳細 */}
          {selectedDate && (
            <div className="mt-6 bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {new Date(selectedDate).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                の除外日
              </h3>

              {selectedDateExclusions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">この日は除外日が登録されていません</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    この日を除外日に登録
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateExclusions.map((exclusion) => (
                    <div
                      key={exclusion.id}
                      className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-200 text-red-800">
                            {getTimeLabel(exclusion)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {exclusion.reason}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          登録者: {exclusion.contractor}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteExclusion(exclusion.id)}
                        className="text-red-600 hover:text-red-900 ml-4"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">除外日を追加</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日付 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={selectedDate || ''}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  時間帯 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={() => setNewTimeType('all_day')}
                    className={`px-3 py-2 rounded-md text-sm font-medium border ${
                      newTimeType === 'all_day'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    終日
                  </button>
                  <button
                    onClick={() => setNewTimeType('am')}
                    className={`px-3 py-2 rounded-md text-sm font-medium border ${
                      newTimeType === 'am'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    午前
                  </button>
                  <button
                    onClick={() => setNewTimeType('pm')}
                    className={`px-3 py-2 rounded-md text-sm font-medium border ${
                      newTimeType === 'pm'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    午後
                  </button>
                  <button
                    onClick={() => setNewTimeType('custom')}
                    className={`px-3 py-2 rounded-md text-sm font-medium border ${
                      newTimeType === 'custom'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    時間指定
                  </button>
                </div>

                {newTimeType === 'custom' && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50 rounded-md">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        開始時刻
                      </label>
                      <input
                        type="time"
                        value={newStartTime}
                        onChange={(e) => setNewStartTime(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        終了時刻
                      </label>
                      <input
                        type="time"
                        value={newEndTime}
                        onChange={(e) => setNewEndTime(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  理由 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="除外する理由を入力してください（例: 社員研修、定期メンテナンス等）"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setNewReason('')
                    setNewTimeType('all_day')
                    setNewStartTime('09:00')
                    setNewEndTime('18:00')
                  }}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAddExclusion}
                  disabled={!selectedDate || !newReason.trim()}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
