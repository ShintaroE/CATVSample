'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { getTeamsByContractorId } from '@/lib/contractors'
import { Team, ExclusionEntry } from '@/types/contractor'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

// サンプルデータ
const initialExclusions: ExclusionEntry[] = [
  {
    id: '1',
    date: '2025-10-10',
    reason: '社員研修',
    contractor: '栄光電気通信',
    contractorId: 'contractor-2',
    teamId: 'team-3',
    teamName: '1班',
    timeType: 'all_day',
  },
  {
    id: '2',
    date: '2025-10-11',
    reason: '車両点検',
    contractor: '直営班',
    contractorId: 'contractor-1',
    teamId: 'team-1',
    teamName: 'A班',
    timeType: 'am',
  },
  {
    id: '3',
    date: '2025-10-20',
    reason: '定期メンテナンス',
    contractor: 'スライヴ',
    contractorId: 'contractor-3',
    teamId: 'team-4',
    teamName: '第1班',
    timeType: 'custom',
    startTime: '13:00',
    endTime: '17:00',
  },
]

export default function MyExclusionsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [exclusions, setExclusions] = useState<ExclusionEntry[]>(initialExclusions)
  const [availableTeams, setAvailableTeams] = useState<Team[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')
  const [newReason, setNewReason] = useState('')
  const [newTimeType, setNewTimeType] = useState<'all_day' | 'am' | 'pm' | 'custom'>('all_day')
  const [newStartTime, setNewStartTime] = useState('09:00')
  const [newEndTime, setNewEndTime] = useState('18:00')

  // カレンダーの日付配列を生成（フックは条件分岐の前に配置）
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

  // 自分の協力会社の除外日のみフィルター
  const myExclusions = user ? exclusions.filter((ex) => ex.contractorId === user.contractorId) : []

  // 認証チェックと班データの読み込み
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login')
      return
    }

    // 協力会社ユーザーのみアクセス可能
    if (user.role !== 'contractor') {
      router.push('/')
      return
    }

    // 協力会社の班を取得
    const teams = getTeamsByContractorId(user.contractorId)
    setAvailableTeams(teams)

    // デフォルトで最初の班を選択
    if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id)
    }
  }, [isAuthenticated, user, router, selectedTeamId])

  // ローディング中またはアクセス権限なしの場合は何も表示しない
  if (!isAuthenticated || !user || user.role !== 'contractor') {
    return null
  }

  // 指定日の除外日を取得
  const getExclusionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return myExclusions.filter((ex) => ex.date === dateStr)
  }

  // 月を変更
  const changeMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentMonth(newMonth)
  }

  // 除外日追加モーダルを開く
  const openAddModal = (dateStr?: string) => {
    setSelectedDate(dateStr || new Date().toISOString().split('T')[0])
    setNewReason('')
    setNewTimeType('all_day')
    setNewStartTime('09:00')
    setNewEndTime('18:00')
    setShowAddModal(true)
  }

  // 除外日を追加
  const handleAddExclusion = () => {
    if (!selectedDate || !newReason.trim() || !selectedTeamId) {
      alert('すべての項目を入力してください')
      return
    }

    // カスタム時間の場合、開始時刻 < 終了時刻をチェック
    if (newTimeType === 'custom') {
      if (newStartTime >= newEndTime) {
        alert('開始時刻は終了時刻より前にしてください')
        return
      }
    }

    const selectedTeam = availableTeams.find(t => t.id === selectedTeamId)
    if (!selectedTeam) {
      alert('班を選択してください')
      return
    }

    const newExclusion: ExclusionEntry = {
      id: `exc-${Date.now()}`,
      date: selectedDate,
      reason: newReason,
      contractor: user.contractor,
      contractorId: user.contractorId,
      teamId: selectedTeamId,
      teamName: selectedTeam.teamName,
      timeType: newTimeType,
      startTime: newTimeType === 'custom' ? newStartTime : undefined,
      endTime: newTimeType === 'custom' ? newEndTime : undefined,
    }

    setExclusions([...exclusions, newExclusion])
    setShowAddModal(false)
  }

  // 除外日を削除
  const handleDeleteExclusion = (id: string) => {
    if (confirm('この除外日を削除してもよろしいですか？')) {
      setExclusions(exclusions.filter((ex) => ex.id !== id))
    }
  }

  // 時間タイプの表示テキスト
  const getTimeTypeText = (exclusion: ExclusionEntry) => {
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">除外日管理</h1>
                <p className="mt-1 text-sm text-gray-600">所属: {user.contractor}</p>
              </div>
              <button
                onClick={() => openAddModal()}
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
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-4 py-5 sm:p-6">
              {/* カレンダーヘッダー */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => changeMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
                </h2>
                <button
                  onClick={() => changeMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* カレンダーグリッド */}
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-7 gap-0 border-b border-gray-200">
                  {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                    <div
                      key={day}
                      className={`p-2 text-center text-sm font-medium ${
                        index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
                      } bg-gray-50 border-r border-gray-200 last:border-r-0`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0">
                  {calendarDays.map((date, index) => {
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
                    const dateExclusions = getExclusionsForDate(date)
                    const isToday = date.toDateString() === new Date().toDateString()

                    return (
                      <div
                        key={index}
                        className={`min-h-24 p-2 border-r border-b border-gray-200 last:border-r-0 ${
                          !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                        } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          !isCurrentMonth ? 'text-gray-400' :
                          isToday ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {date.getDate()}
                        </div>

                        {dateExclusions.length > 0 && (
                          <div className="space-y-1">
                            {dateExclusions.map((exclusion) => (
                              <div
                                key={exclusion.id}
                                className="text-xs p-1 rounded bg-red-50 border border-red-200 text-red-700"
                              >
                                <div className="font-medium">{exclusion.teamName}</div>
                                <div>{getTimeTypeText(exclusion)}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 除外日一覧 */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                登録済み除外日一覧
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        班
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        日付
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        時間
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        理由
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {myExclusions
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map((exclusion) => (
                        <tr key={exclusion.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {exclusion.teamName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(exclusion.date).toLocaleDateString('ja-JP')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getTimeTypeText(exclusion)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {exclusion.reason}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => handleDeleteExclusion(exclusion.id)}
                              className="inline-flex items-center text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-4 w-4 mr-1" />
                              削除
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {myExclusions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">除外日が登録されていません</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* 除外日追加モーダル */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">除外日を追加</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">班</label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                  >
                    <option value="">班を選択してください</option>
                    {availableTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.teamName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">日付</label>
                  <input
                    type="date"
                    value={selectedDate || ''}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">時間</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="all_day"
                        checked={newTimeType === 'all_day'}
                        onChange={(e) => setNewTimeType(e.target.value as 'all_day' | 'am' | 'pm' | 'custom')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">終日（9:00-18:00）</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="am"
                        checked={newTimeType === 'am'}
                        onChange={(e) => setNewTimeType(e.target.value as 'all_day' | 'am' | 'pm' | 'custom')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">午前（9:00-12:00）</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="pm"
                        checked={newTimeType === 'pm'}
                        onChange={(e) => setNewTimeType(e.target.value as 'all_day' | 'am' | 'pm' | 'custom')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">午後（12:00-18:00）</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="custom"
                        checked={newTimeType === 'custom'}
                        onChange={(e) => setNewTimeType(e.target.value as 'all_day' | 'am' | 'pm' | 'custom')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">カスタム</span>
                    </label>
                  </div>
                </div>

                {newTimeType === 'custom' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">開始時刻</label>
                      <input
                        type="time"
                        value={newStartTime}
                        onChange={(e) => setNewStartTime(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">終了時刻</label>
                      <input
                        type="time"
                        value={newEndTime}
                        onChange={(e) => setNewEndTime(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">理由</label>
                  <textarea
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                    rows={3}
                    placeholder="除外理由を入力してください"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAddExclusion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
