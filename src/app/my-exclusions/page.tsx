'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/shared/components/layout/Layout'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getTeamsByContractorId } from '@/features/contractor/lib/contractorStorage'
import { ExclusionEntry } from '@/app/schedule/types'
import { useScheduleData } from './hooks/useScheduleData'
import { useExclusionData } from './hooks/useExclusionData'
import ExclusionCalendar from './components/ExclusionCalendar'
import TeamFilter from './components/TeamFilter'
import DayDetailModal from './components/DayDetailModal'

/**
 * 除外日管理ページ
 * 協力会社専用：工事日程のスケジュール表示と除外日の登録・管理
 */
export default function MyExclusionsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  // 状態管理
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([])
  const [teams, setTeams] = useState<ReturnType<typeof getTeamsByContractorId>>([])

  // データ取得
  const { schedules, filterByTeams: filterSchedulesByTeams } = useScheduleData(user?.contractorId || '')
  const {
    exclusions,
    addExclusion,
    updateExclusion,
    deleteExclusion,
    filterByTeams: filterExclusionsByTeams
  } = useExclusionData(user?.contractorId || '')

  // 認証チェックと初期化
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
    const contractorTeams = getTeamsByContractorId(user.contractorId)
    setTeams(contractorTeams)

    // 初期選択: 全ての班を選択
    const activeTeamIds = contractorTeams.filter(t => t.isActive).map(t => t.id)
    setSelectedTeamIds(activeTeamIds)
  }, [isAuthenticated, user, router])

  // フィルタリング
  const filteredSchedules = useMemo(() => {
    return filterSchedulesByTeams(selectedTeamIds)
  }, [filterSchedulesByTeams, selectedTeamIds])

  const filteredExclusions = useMemo(() => {
    return filterExclusionsByTeams(selectedTeamIds)
  }, [filterExclusionsByTeams, selectedTeamIds])

  // 選択日付のデータ
  const selectedDateSchedules = useMemo(() => {
    if (!selectedDate) return []
    return filteredSchedules.filter(s => s.assignedDate === selectedDate)
  }, [selectedDate, filteredSchedules])

  const selectedDateExclusions = useMemo(() => {
    if (!selectedDate) return []
    return filteredExclusions.filter(e => e.date === selectedDate)
  }, [selectedDate, filteredExclusions])

  // 月変更
  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentMonth(newMonth)
  }

  // 除外日追加
  const handleExclusionAdd = (data: Omit<ExclusionEntry, 'id'>) => {
    const newExclusion: ExclusionEntry = {
      ...data,
      id: 'exclusion-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    }
    addExclusion(newExclusion)
  }

  // ローディング中またはアクセス権限なしの場合は何も表示しない
  if (!isAuthenticated || !user || user.role !== 'contractor') {
    return null
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">除外日管理</h1>
          <p className="mt-1 text-sm text-gray-600">所属: {user.contractor}</p>
        </div>

        {/* フィルター */}
        <div className="mb-4">
          <TeamFilter
            teams={teams}
            selectedTeamIds={selectedTeamIds}
            onSelectionChange={setSelectedTeamIds}
          />
        </div>

        {/* メインコンテンツ: カレンダー */}
        <div className="max-w-7xl mx-auto">
          <ExclusionCalendar
            currentMonth={currentMonth}
            schedules={filteredSchedules}
            exclusions={filteredExclusions}
            selectedDate={selectedDate}
            onDateClick={setSelectedDate}
            onMonthChange={handleMonthChange}
          />
        </div>

        {/* 日付詳細モーダル */}
        <DayDetailModal
          isOpen={selectedDate !== null}
          date={selectedDate || ''}
          schedules={selectedDateSchedules}
          exclusions={selectedDateExclusions}
          teams={teams}
          contractorId={user.contractorId}
          contractorName={user.contractor}
          onExclusionAdd={handleExclusionAdd}
          onExclusionUpdate={updateExclusion}
          onExclusionDelete={deleteExclusion}
          onClose={() => setSelectedDate(null)}
        />
      </div>
    </Layout>
  )
}
