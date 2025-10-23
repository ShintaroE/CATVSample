'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import Layout from '@/components/Layout'
import { getContractors, getTeams } from '@/lib/contractors'

interface ScheduleItem {
  id: string
  orderNumber: string
  customerName: string
  address: string
  workType: string
  contractor: '直営班' | '栄光電気' | 'スライヴ'
  contractorId: string
  teamId?: string
  teamName?: string
  assignedDate: string
  timeSlot: string
  status: '予定' | '作業中' | '完了' | '延期'
  memo?: string
}

interface ExclusionEntry {
  id: string
  date: string
  reason: string
  contractor: string
  contractorId: string
  teamId: string
  teamName: string
  timeType: 'all_day' | 'am' | 'pm' | 'custom'
  startTime?: string
  endTime?: string
}

interface TeamFilter {
  contractorId: string
  contractorName: string
  teamId: string
  teamName: string
  isVisible: boolean
  color: string
}

interface ColumnDefinition {
  contractorId: string
  contractorName: string
  teamId: string
  teamName: string
  color: string
  displayName: string
  isVisible: boolean
}

const contractors = ['直営班', '栄光電気', 'スライヴ'] as const
const statuses = ['予定', '作業中', '完了', '延期'] as const

// 日表示の定数
const HOUR_HEIGHT = 4 // 1時間 = 4rem (64px at default font size)
const BUSINESS_START_HOUR = 9
const BUSINESS_END_HOUR = 18

// サンプル除外日データ
const sampleExclusions: ExclusionEntry[] = [
  {
    id: 'e1',
    date: '2025-09-10',
    reason: '社員研修',
    contractor: '栄光電気',
    contractorId: 'contractor-2',
    teamId: 'team-3',
    teamName: '1班',
    timeType: 'all_day',
  },
  {
    id: 'e2',
    date: '2025-09-11',
    reason: '定期メンテナンス',
    contractor: 'スライヴ',
    contractorId: 'contractor-3',
    teamId: 'team-4',
    teamName: '第1班',
    timeType: 'am',
  },
  {
    id: 'e3',
    date: '2025-09-15',
    reason: '車両点検',
    contractor: '直営班',
    contractorId: 'contractor-1',
    teamId: 'team-1',
    teamName: 'A班',
    timeType: 'custom',
    startTime: '13:00',
    endTime: '17:00',
  },
]

const sampleSchedules: ScheduleItem[] = [
  {
    id: '1',
    orderNumber: '2025091000001',
    customerName: '田中太郎',
    address: '倉敷市水島青葉町1-1-1',
    workType: '個別対応',
    contractor: '直営班',
    contractorId: 'contractor-1',
    teamId: 'team-1',
    teamName: 'A班',
    assignedDate: '2025-09-10',
    timeSlot: '09:00-12:00',
    status: '予定',
    memo: '事前調査完了済み'
  },
  {
    id: '2',
    orderNumber: '2025091100002',
    customerName: '佐藤花子',
    address: '倉敷市児島駅前2-2-2',
    workType: 'HCNA技術人工事',
    contractor: '栄光電気',
    contractorId: 'contractor-2',
    teamId: 'team-3',
    teamName: '1班',
    assignedDate: '2025-09-11',
    timeSlot: '13:00-17:00',
    status: '作業中'
  },
  {
    id: '3',
    orderNumber: '2025091200003',
    customerName: '山田次郎',
    address: '倉敷市玉島中央町3-3-3',
    workType: 'G・6ch追加人工事',
    contractor: 'スライヴ',
    contractorId: 'contractor-3',
    teamId: 'team-4',
    teamName: '第1班',
    assignedDate: '2025-09-12',
    timeSlot: '09:00-12:00',
    status: '予定'
  },
  {
    id: '4',
    orderNumber: '2025091300004',
    customerName: '鈴木一郎',
    address: '倉敷市中央1-4-5',
    workType: '放送波人工事',
    contractor: '直営班',
    contractorId: 'contractor-1',
    teamId: 'team-2',
    teamName: 'B班',
    assignedDate: '2025-09-13',
    timeSlot: '13:00-17:00',
    status: '完了'
  },
  {
    id: '5',
    orderNumber: '2025091500005',
    customerName: '高橋美咲',
    address: '倉敷市老松町2-8-15',
    workType: '個別対応',
    contractor: '栄光電気',
    contractorId: 'contractor-2',
    teamId: 'team-3',
    teamName: '1班',
    assignedDate: '2025-09-15',
    timeSlot: '終日',
    status: '予定',
    memo: '大規模工事のため終日対応'
  },
  {
    id: '6',
    orderNumber: '2025091600006',
    customerName: '渡辺健一',
    address: '倉敷市連島町鶴新田1-10-3',
    workType: 'G・6ch追加人工事',
    contractor: 'スライヴ',
    contractorId: 'contractor-3',
    teamId: 'team-4',
    teamName: '第1班',
    assignedDate: '2025-09-16',
    timeSlot: '09:00-12:00',
    status: '延期'
  }
]

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(sampleSchedules)
  const [exclusions] = useState<ExclusionEntry[]>(sampleExclusions)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2025, 8, 15)) // 2025年9月15日
  const [selectedDate, setSelectedDate] = useState<string>('2025-09-15')
  const [selectedDateForAdd, setSelectedDateForAdd] = useState<string | null>(null) // 新規登録用の選択日
  const [teamFilters, setTeamFilters] = useState<TeamFilter[]>([])
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const getTimeLabel = (entry: ExclusionEntry): string => {
    switch (entry.timeType) {
      case 'all_day':
        return '終日'
      case 'am':
        return '午前'
      case 'pm':
        return '午後'
      case 'custom':
        return `${entry.startTime}-${entry.endTime}`
      default:
        return '終日'
    }
  }
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [newSchedule, setNewSchedule] = useState<Partial<ScheduleItem>>({
    orderNumber: '',
    customerName: '',
    address: '',
    workType: '',
    contractor: '直営班',
    assignedDate: '2025-09-15',
    timeSlot: '09:00-12:00',
    status: '予定',
    memo: ''
  })
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('12:00')

  // 協力会社の色名を取得
  const getContractorColorName = (contractorName: string): string => {
    const colorMap: Record<string, string> = {
      '直営班': 'blue',
      '栄光電気': 'green',
      'スライヴ': 'purple',
    }
    return colorMap[contractorName] || 'gray'
  }

  // フィルター初期化
  useEffect(() => {
    const contractors = getContractors()
    const teams = getTeams()

    const filters: TeamFilter[] = []

    contractors.forEach(contractor => {
      const contractorTeams = teams.filter(t => t.contractorId === contractor.id && t.isActive)

      contractorTeams.forEach(team => {
        filters.push({
          contractorId: contractor.id,
          contractorName: contractor.name,
          teamId: team.id,
          teamName: team.teamName,
          isVisible: true,
          color: getContractorColorName(contractor.name)
        })
      })
    })

    setTeamFilters(filters)
  }, [])

  // 協力会社のチェック状態を取得
  const getContractorCheckState = (contractorId: string): 'all' | 'some' | 'none' => {
    const contractorFilters = teamFilters.filter(f => f.contractorId === contractorId)
    if (contractorFilters.length === 0) return 'none'

    const visibleCount = contractorFilters.filter(f => f.isVisible).length

    if (visibleCount === 0) return 'none'
    if (visibleCount === contractorFilters.length) return 'all'
    return 'some'
  }

  // 協力会社グループを取得
  const getContractorGroups = () => {
    const contractors = getContractors()

    return contractors.map(contractor => {
      const contractorTeamFilters = teamFilters.filter(f => f.contractorId === contractor.id)

      return {
        id: contractor.id,
        name: contractor.name,
        color: getContractorColorName(contractor.name),
        checkState: getContractorCheckState(contractor.id),
        teams: contractorTeamFilters.map(f => ({
          id: f.teamId,
          name: f.teamName,
          isVisible: f.isVisible
        }))
      }
    }).filter(c => c.teams.length > 0)
  }

  // 全て選択/解除
  const handleToggleAll = (checked: boolean) => {
    setTeamFilters(prev =>
      prev.map(filter => ({ ...filter, isVisible: checked }))
    )
  }

  // 協力会社単位で選択
  const handleToggleContractor = (contractorId: string, checked: boolean) => {
    setTeamFilters(prev =>
      prev.map(filter =>
        filter.contractorId === contractorId
          ? { ...filter, isVisible: checked }
          : filter
      )
    )
  }

  // 班単位で選択
  const handleToggleTeam = (teamId: string, checked: boolean) => {
    setTeamFilters(prev =>
      prev.map(filter =>
        filter.teamId === teamId
          ? { ...filter, isVisible: checked }
          : filter
      )
    )
  }

  // フィルタリング済みスケジュールを取得
  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      if (teamFilters.length === 0) return true

      if (!schedule.teamId) {
        return teamFilters.some(f =>
          f.contractorName === schedule.contractor && f.isVisible
        )
      }

      return teamFilters.some(f =>
        f.teamId === schedule.teamId && f.isVisible
      )
    })
  }, [schedules, teamFilters])

  // フィルタリング済み除外日を取得
  const filteredExclusions = useMemo(() => {
    return exclusions.filter(exclusion => {
      if (teamFilters.length === 0) return true

      return teamFilters.some(f =>
        f.teamId === exclusion.teamId && f.isVisible
      )
    })
  }, [exclusions, teamFilters])

  // 日表示用の列定義を取得
  const getVisibleColumns = (): ColumnDefinition[] => {
    return teamFilters
      .filter(f => f.isVisible)
      .map(f => ({
        contractorId: f.contractorId,
        contractorName: f.contractorName,
        teamId: f.teamId,
        teamName: f.teamName,
        color: f.color,
        displayName: `${f.contractorName} - ${f.teamName}`,
        isVisible: true
      }))
      .sort((a, b) => {
        if (a.contractorName !== b.contractorName) {
          return a.contractorName.localeCompare(b.contractorName, 'ja')
        }
        return a.teamName.localeCompare(b.teamName, 'ja')
      })
  }

  const visibleColumns = useMemo(() => getVisibleColumns(), [teamFilters])

  // 特定の班のスケジュールを取得
  const getSchedulesByTeam = (teamId: string, date: string) => {
    return filteredSchedules.filter(s =>
      s.teamId === teamId && s.assignedDate === date
    ).sort((a, b) => {
      const aStart = a.timeSlot.split('-')[0] || a.timeSlot
      const bStart = b.timeSlot.split('-')[0] || b.timeSlot
      return aStart.localeCompare(bStart)
    })
  }

  // 特定の班の除外日を取得
  const getExclusionsByTeam = (teamId: string, date: string) => {
    return filteredExclusions.filter(e =>
      e.teamId === teamId && e.date === date
    )
  }

  // 班ごとのスケジュールをメモ化
  const schedulesByColumn = useMemo(() => {
    const result: Record<string, ScheduleItem[]> = {}
    visibleColumns.forEach(column => {
      result[column.teamId] = getSchedulesByTeam(column.teamId, selectedDate)
    })
    return result
  }, [visibleColumns, filteredSchedules, selectedDate])

  // 班ごとの除外日をメモ化
  const exclusionsByColumn = useMemo(() => {
    const result: Record<string, ExclusionEntry[]> = {}
    visibleColumns.forEach(column => {
      result[column.teamId] = getExclusionsByTeam(column.teamId, selectedDate)
    })
    return result
  }, [visibleColumns, filteredExclusions, selectedDate])

  // カレンダーナビゲーション
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
    if (viewMode === 'day') {
      setSelectedDate(formatDateString(newDate))
    }
  }

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

  // 週表示用の日付配列を生成
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()) // 日曜日から開始

    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      days.push(date)
    }
    return days
  }

  // 日付をYYYY-MM-DD形式の文字列に変換（タイムゾーン考慮）
  const formatDateString = (date: Date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 日表示用: スケジュールの開始位置を計算（rem）
  const calculateScheduleTop = (timeSlot: string): string => {
    if (timeSlot === '終日') return '0rem'

    const [startTime] = timeSlot.split('-')
    if (!startTime) return '0rem'

    const [hour, minute] = startTime.split(':').map(Number)
    const minutesFromStart = (hour - BUSINESS_START_HOUR) * 60 + minute
    return `${(minutesFromStart / 60) * HOUR_HEIGHT}rem`
  }

  // 日表示用: スケジュールの高さを計算（rem）
  const calculateScheduleHeight = (timeSlot: string): string => {
    if (timeSlot === '終日') {
      return `${(BUSINESS_END_HOUR - BUSINESS_START_HOUR) * HOUR_HEIGHT}rem`
    }

    const [startTime, endTime] = timeSlot.split('-')
    if (!startTime || !endTime) return `${HOUR_HEIGHT}rem`

    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute
    const durationMinutes = endMinutes - startMinutes

    return `${Math.max((durationMinutes / 60) * HOUR_HEIGHT, 2)}rem` // 最小2rem
  }

  // 日表示用: 除外日の開始位置を計算（rem）
  const calculateExclusionTop = (exclusion: ExclusionEntry): string => {
    switch (exclusion.timeType) {
      case 'all_day':
        return '0rem'
      case 'am':
        return '0rem'
      case 'pm':
        return `${(12 - BUSINESS_START_HOUR) * HOUR_HEIGHT}rem`
      case 'custom':
        if (!exclusion.startTime) return '0rem'
        const [hour, minute] = exclusion.startTime.split(':').map(Number)
        const minutesFromStart = (hour - BUSINESS_START_HOUR) * 60 + minute
        return `${(minutesFromStart / 60) * HOUR_HEIGHT}rem`
      default:
        return '0rem'
    }
  }

  // 日表示用: 除外日の高さを計算（rem）
  const calculateExclusionHeight = (exclusion: ExclusionEntry): string => {
    switch (exclusion.timeType) {
      case 'all_day':
        return `${(BUSINESS_END_HOUR - BUSINESS_START_HOUR) * HOUR_HEIGHT}rem`
      case 'am':
        return `${(12 - BUSINESS_START_HOUR) * HOUR_HEIGHT}rem`
      case 'pm':
        return `${(BUSINESS_END_HOUR - 12) * HOUR_HEIGHT}rem`
      case 'custom':
        if (!exclusion.startTime || !exclusion.endTime) return `${HOUR_HEIGHT}rem`
        const [startHour, startMinute] = exclusion.startTime.split(':').map(Number)
        const [endHour, endMinute] = exclusion.endTime.split(':').map(Number)
        const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute)
        return `${Math.max((durationMinutes / 60) * HOUR_HEIGHT, 2)}rem`
      default:
        return `${HOUR_HEIGHT}rem`
    }
  }

  // 日表示用: 時間スロット配列を生成
  const getTimeSlots = () => {
    const slots = []
    for (let hour = BUSINESS_START_HOUR; hour <= BUSINESS_END_HOUR; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
    }
    return slots
  }

  // 日表示用: 列幅設定を計算（flexベースで画面サイズに対応）
  const getColumnWidthConfig = useMemo(() => {
    const columnCount = visibleColumns.length
    if (columnCount === 0) {
      return { useFlex: false, minWidth: '180px' }
    }

    // 少ない場合は画面を埋め尽くす、多い場合は固定幅で横スクロール
    if (columnCount <= 5) {
      // 1-5列: flexで画面を埋め尽くす（レスポンシブ）
      return { useFlex: true, minWidth: '200px' }
    } else {
      // 6列以上: 固定幅で横スクロール
      return { useFlex: false, minWidth: '180px' }
    }
  }, [visibleColumns.length])

  // 特定の日付のスケジュールを取得（フィルタリング適用）
  const getSchedulesForDate = (date: Date) => {
    const dateStr = formatDateString(date)
    return filteredSchedules.filter(schedule =>
      schedule.assignedDate === dateStr
    )
  }

  // 日付をクリックした時の処理（月表示・週表示用）
  const handleDateSelect = (date: Date) => {
    const dateStr = formatDateString(date)
    setSelectedDateForAdd(dateStr)
    setCurrentDate(date) // 週表示・日表示に切り替えたときにこの日付が反映されるように
    setSelectedDate(dateStr) // 日表示のスケジュールデータを更新
  }

  // 日付をダブルクリックした時の処理（日ビューに移動）
  const handleDateDoubleClick = (date: Date) => {
    const dateStr = formatDateString(date)
    setSelectedDate(dateStr)
    setCurrentDate(date)
    setViewMode('day')
  }

  // 今日に戻る
  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(formatDateString(today))
  }

  // 1時間ごとの時間軸を生成（9:00-18:00）
  const getHourlyTimeSlots = () => {
    const hours = []
    for (let i = 9; i <= 18; i++) {
      hours.push(`${i.toString().padStart(2, '0')}:00`)
    }
    return hours
  }

  // 除外日の時間範囲を解析してポジションを計算
  const getExclusionPosition = (exclusion: ExclusionEntry) => {
    if (exclusion.timeType === 'all_day') {
      return { top: 0, height: '100%' }
    }

    if (exclusion.timeType === 'am') {
      return { top: 0, height: '50%' }
    }

    if (exclusion.timeType === 'pm') {
      return { top: '50%', height: '50%' }
    }

    if (exclusion.timeType === 'custom' && exclusion.startTime && exclusion.endTime) {
      const startHour = parseInt(exclusion.startTime.split(':')[0])
      const startMinute = parseInt(exclusion.startTime.split(':')[1])
      const endHour = parseInt(exclusion.endTime.split(':')[0])
      const endMinute = parseInt(exclusion.endTime.split(':')[1])

      const startPosition = (startHour - 9) * 4 + (startMinute / 60) * 4 // 1時間 = 4rem
      const endPosition = (endHour - 9) * 4 + (endMinute / 60) * 4
      const height = endPosition - startPosition

      return { top: `${startPosition}rem`, height: `${height}rem` }
    }

    return { top: 0, height: '100%' }
  }

  // 予定の時間範囲を解析してポジションを計算
  const getSchedulePosition = (timeSlot: string) => {
    if (timeSlot === '終日') {
      return { top: 0, height: '100%' }
    }

    const [startTime, endTime] = timeSlot.split('-')
    const startHour = parseInt(startTime.split(':')[0])
    const endHour = parseInt(endTime.split(':')[0])

    const startPosition = (startHour - 9) * 4 // 1時間 = 4rem (64px)
    const duration = endHour - startHour
    const height = duration * 4

    return {
      top: `${startPosition}rem`,
      height: `${height}rem`
    }
  }

  // 除外日の時間範囲を文字列化
  const getExclusionTimeSlot = (exclusion: ExclusionEntry): string => {
    if (exclusion.timeType === 'all_day') {
      return '終日'
    }
    if (exclusion.timeType === 'am') {
      return '09:00-13:00'
    }
    if (exclusion.timeType === 'pm') {
      return '13:00-18:00'
    }
    if (exclusion.timeType === 'custom' && exclusion.startTime && exclusion.endTime) {
      return `${exclusion.startTime}-${exclusion.endTime}`
    }
    return '終日'
  }

  // 時間範囲が重複しているかチェック
  const isTimeOverlapping = (timeSlot1: string, timeSlot2: string) => {
    if (timeSlot1 === '終日' || timeSlot2 === '終日') {
      return true
    }

    const [start1, end1] = timeSlot1.split('-').map(t => parseInt(t.split(':')[0]))
    const [start2, end2] = timeSlot2.split('-').map(t => parseInt(t.split(':')[0]))

    return start1 < end2 && start2 < end1
  }

  // 予定と除外日を統合した型
  type CalendarItem =
    | { type: 'schedule'; data: ScheduleItem; timeSlot: string }
    | { type: 'exclusion'; data: ExclusionEntry; timeSlot: string }

  // 重複する予定・除外日の位置とサイズを計算（統合版）
  const calculateOverlappingLayoutWithExclusions = (schedules: ScheduleItem[], exclusions: ExclusionEntry[]) => {
    // 予定と除外日を統合
    const items: CalendarItem[] = [
      ...schedules.map(s => ({ type: 'schedule' as const, data: s, timeSlot: s.timeSlot })),
      ...exclusions.map(e => ({ type: 'exclusion' as const, data: e, timeSlot: getExclusionTimeSlot(e) }))
    ]

    const result = items.map((item, index) => {
      const overlapping: CalendarItem[] = []
      let position = 0

      // このアイテムと重複する他のアイテムを検索
      for (let i = 0; i < items.length; i++) {
        if (i !== index && isTimeOverlapping(item.timeSlot, items[i].timeSlot)) {
          overlapping.push(items[i])
          if (i < index) position++
        }
      }

      const totalOverlapping = overlapping.length + 1
      const width = totalOverlapping > 1 ? `${100 / totalOverlapping}%` : '100%'
      const left = totalOverlapping > 1 ? `${(position * 100) / totalOverlapping}%` : '0%'

      return {
        item,
        width,
        left,
        zIndex: totalOverlapping - position
      }
    })

    return result
  }


  const handleEditSchedule = (schedule: ScheduleItem) => {
    setEditingSchedule(schedule)

    // 既存の時間帯を開始・終了時刻に分割
    if (schedule.timeSlot === '終日') {
      setStartTime('09:00')
      setEndTime('18:00')
    } else if (schedule.timeSlot.includes('-')) {
      const [start, end] = schedule.timeSlot.split('-')
      setStartTime(start)
      setEndTime(end)
    }

    setShowEditModal(true)
  }

  const handleSaveSchedule = () => {
    if (!editingSchedule) return

    const timeSlot = endTime === startTime ? '終日' : `${startTime}-${endTime}`
    const updatedSchedule = { ...editingSchedule, timeSlot }

    setSchedules(prev => prev.map(s =>
      s.id === editingSchedule.id ? updatedSchedule : s
    ))
    setShowEditModal(false)
    setEditingSchedule(null)
  }

  const handleAddSchedule = () => {
    // 選択された日付があればそれを使用、なければ現在のselectedDateを使用
    const dateToUse = selectedDateForAdd || selectedDate
    setNewSchedule({
      ...newSchedule,
      assignedDate: dateToUse
    })
    setShowAddModal(true)
  }

  const handleSaveNewSchedule = () => {
    if (!newSchedule.customerName || !newSchedule.address) return

    const newId = String(Date.now())
    const timeSlot = endTime === startTime ? '終日' : `${startTime}-${endTime}`

    const schedule: ScheduleItem = {
      id: newId,
      orderNumber: newSchedule.orderNumber || `AUTO${newId}`,
      customerName: newSchedule.customerName!,
      address: newSchedule.address!,
      workType: newSchedule.workType || '個別対応',
      contractor: newSchedule.contractor as typeof contractors[number],
      assignedDate: newSchedule.assignedDate!,
      timeSlot: timeSlot,
      status: newSchedule.status as typeof statuses[number],
      memo: newSchedule.memo
    }

    setSchedules(prev => [...prev, schedule])
    setShowAddModal(false)
    setSelectedDateForAdd(null) // 選択状態をクリア
    setNewSchedule({
      orderNumber: '',
      customerName: '',
      address: '',
      workType: '',
      contractor: '直営班',
      assignedDate: selectedDate,
      timeSlot: '09:00-12:00',
      status: '予定',
      memo: ''
    })
    setStartTime('09:00')
    setEndTime('12:00')
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case '予定':
        return 'bg-blue-100 text-blue-800'
      case '作業中':
        return 'bg-yellow-100 text-yellow-800'
      case '完了':
        return 'bg-green-100 text-green-800'
      case '延期':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getContractorColor = (contractor: string) => {
    switch (contractor) {
      case '直営班':
        return 'bg-blue-200 border-blue-300 text-blue-900'
      case '栄光電気':
        return 'bg-green-200 border-green-300 text-green-900'
      case 'スライヴ':
        return 'bg-purple-200 border-purple-300 text-purple-900'
      default:
        return 'bg-gray-200 border-gray-300 text-gray-900'
    }
  }

  // バー表示用の濃い色を取得
  const getContractorBarColor = (contractor: string) => {
    switch (contractor) {
      case '直営班':
        return 'bg-blue-500 border-blue-600 text-white'
      case '栄光電気':
        return 'bg-green-500 border-green-600 text-white'
      case 'スライヴ':
        return 'bg-purple-500 border-purple-600 text-white'
      default:
        return 'bg-gray-500 border-gray-600 text-white'
    }
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    const month = d.getMonth() + 1
    const day = d.getDate()
    const weekdays = ['日', '月', '火', '水', '木', '金', '土']
    const weekday = weekdays[d.getDay()]
    return `${month}/${day}(${weekday})`
  }

  const formatMonthYear = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }


  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
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
          {/* カレンダーコントロールパネル */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* ナビゲーション */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateDate('prev')}
                    className="p-2 hover:bg-gray-100 rounded-md"
                  >
                    <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                  </button>
                  <h2 className="text-xl font-semibold text-gray-900 min-w-40 text-center">
                    {viewMode === 'day' ? formatDate(currentDate) : formatMonthYear(currentDate)}
                  </h2>
                  <button
                    onClick={() => navigateDate('next')}
                    className="p-2 hover:bg-gray-100 rounded-md"
                  >
                    <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                {/* 今日ボタン */}
                <button
                  onClick={goToToday}
                  className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md border border-blue-200"
                >
                  今日
                </button>

                {/* 表示モード */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      viewMode === 'month'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    月
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      viewMode === 'week'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    週
                  </button>
                  <button
                    onClick={() => setViewMode('day')}
                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      viewMode === 'day'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    日
                  </button>
                </div>

                {/* フィルターパネル */}
                <div className="relative">
                  <button
                    onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                    className="flex items-center space-x-2 border border-gray-300 rounded-md px-4 py-2 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">表示フィルター</span>
                    <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${isFilterPanelOpen ? 'rotate-180' : ''}`} />
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                      {teamFilters.filter(f => f.isVisible).length}/{teamFilters.length}
                    </span>
                  </button>

                  {/* ドロップダウンパネル */}
                  {isFilterPanelOpen && (
                    <div className="absolute top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                      {/* 全て選択/解除 */}
                      <div className="border-b border-gray-200 p-3">
                        <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={teamFilters.length > 0 && teamFilters.every(f => f.isVisible)}
                            onChange={(e) => handleToggleAll(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">全て選択</span>
                        </label>
                      </div>

                      {/* 協力会社・班リスト */}
                      <div className="max-h-96 overflow-y-auto p-2">
                        {getContractorGroups().map(contractor => {
                          const checkState = contractor.checkState

                          return (
                            <div key={contractor.id} className="mb-2">
                              {/* 協力会社チェックボックス */}
                              <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                                <div className={`w-3 h-3 rounded-full bg-${contractor.color}-500`} />
                                <input
                                  type="checkbox"
                                  checked={checkState === 'all'}
                                  ref={(el) => {
                                    if (el) el.indeterminate = checkState === 'some'
                                  }}
                                  onChange={(e) => handleToggleContractor(contractor.id, e.target.checked)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-900">{contractor.name}</span>
                              </label>

                              {/* 班チェックボックス */}
                              <div className="ml-8 mt-1 space-y-1">
                                {contractor.teams.map(team => (
                                  <label
                                    key={team.id}
                                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={team.isVisible}
                                      onChange={(e) => handleToggleTeam(team.id, e.target.checked)}
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{team.name}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAddSchedule}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  {selectedDateForAdd ? (
                    <>新規登録 ({new Date(selectedDateForAdd + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })})</>
                  ) : (
                    '新規登録'
                  )}
                </button>
                {selectedDateForAdd && (
                  <button
                    onClick={() => setSelectedDateForAdd(null)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    選択解除
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 月表示カレンダー */}
          {viewMode === 'month' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
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
                  const daySchedules = getSchedulesForDate(date)
                  const dayExclusions = filteredExclusions.filter(ex => ex.date === dateStr)
                  return (
                    <div
                      key={index}
                      className={`min-h-32 p-2 border-r border-b border-gray-200 last:border-r-0 cursor-pointer hover:bg-gray-50 ${
                        !isCurrentMonth(date) ? 'bg-gray-50' : 'bg-white'
                      } ${dateStr === selectedDateForAdd ? 'bg-blue-100 ring-2 ring-blue-500' : ''} ${
                        isToday(date) ? 'ring-2 ring-green-400' : ''
                      }`}
                      onClick={() => handleDateSelect(date)}
                      onDoubleClick={() => handleDateDoubleClick(date)}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        !isCurrentMonth(date) ? 'text-gray-400' :
                        isToday(date) ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {/* 除外日表示（最優先） */}
                        {dayExclusions.map(exclusion => (
                          <div
                            key={exclusion.id}
                            className="text-xs p-1 rounded border-2 border-dashed border-red-400 bg-red-50"
                            title={`除外日: ${exclusion.contractor} - ${exclusion.teamName} - ${exclusion.reason}`}
                          >
                            <div className="flex items-center space-x-1">
                              <span className="text-red-700 font-bold">🚫</span>
                              <span className="font-medium text-red-800 truncate">{exclusion.contractor} - {exclusion.teamName}</span>
                            </div>
                            <div className="text-[10px] text-red-700 truncate">{getTimeLabel(exclusion)}</div>
                            <div className="text-[10px] text-red-600 truncate italic">{exclusion.reason}</div>
                          </div>
                        ))}

                        {/* 通常のスケジュール */}
                        {daySchedules.slice(0, dayExclusions.length > 0 ? 2 : 3).map(schedule => (
                          <div
                            key={schedule.id}
                            className={`text-xs p-1 rounded truncate cursor-pointer ${getContractorColor(schedule.contractor)}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditSchedule(schedule)
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{schedule.timeSlot}</span>
                              <span className={`w-2 h-2 rounded-full ${getStatusColor(schedule.status).split(' ')[0]}`} />
                            </div>
                            <div className="truncate">{schedule.customerName}</div>
                            {schedule.teamName && (
                              <div className="text-xs opacity-75 truncate">{schedule.teamName}</div>
                            )}
                          </div>
                        ))}
                        {daySchedules.length > (dayExclusions.length > 0 ? 2 : 3) && (
                          <div className="text-xs text-gray-500 text-center">
                            +{daySchedules.length - (dayExclusions.length > 0 ? 2 : 3)}件
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 週表示カレンダー - Outlookライク */}
          {viewMode === 'week' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {/* ヘッダー */}
              <div className="grid grid-cols-8 gap-0 border-b border-gray-200">
                <div className="p-3 bg-gray-50 border-r border-gray-200 text-sm font-medium text-gray-700">
                  時間
                </div>
                {getWeekDays().map((date) => {
                  const dateStr = formatDateString(date)
                  return (
                    <div
                      key={date.toISOString()}
                      className={`p-3 text-center border-r border-gray-200 last:border-r-0 cursor-pointer hover:bg-gray-100 ${
                        dateStr === selectedDateForAdd ? 'bg-blue-200 ring-2 ring-inset ring-blue-500' : 'bg-gray-50'
                      }`}
                      onClick={() => handleDateSelect(date)}
                      onDoubleClick={() => handleDateDoubleClick(date)}
                    >
                      <div className={`text-sm font-medium ${
                        isToday(date) ? 'text-blue-600' :
                        dateStr === selectedDateForAdd ? 'text-blue-900' : 'text-gray-700'
                      }`}>
                        {formatDate(date)}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* タイムスロット */}
              <div className="relative">
                <div className="grid grid-cols-8 gap-0">
                  {/* 時間軸 */}
                  <div className="border-r border-gray-200">
                    {getHourlyTimeSlots().map((hour) => (
                      <div key={hour} className="h-16 border-b border-gray-100 p-2 bg-gray-50">
                        <div className="text-xs text-gray-600">{hour}</div>
                      </div>
                    ))}
                  </div>

                  {/* 各日のカラム */}
                  {getWeekDays().map((date) => {
                    const dateStr = formatDateString(date)
                    const daySchedules = getSchedulesForDate(date)
                    const dayExclusions = filteredExclusions.filter(ex => ex.date === dateStr)
                    const layoutItems = calculateOverlappingLayoutWithExclusions(daySchedules, dayExclusions)

                    return (
                      <div key={date.toISOString()} className={`relative border-r border-gray-200 last:border-r-0 ${
                        dateStr === selectedDateForAdd ? 'bg-blue-50' : ''
                      }`}>
                        {/* 時間グリッド */}
                        {getHourlyTimeSlots().map((hour) => (
                          <div
                            key={hour}
                            className={`h-16 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                              dateStr === selectedDateForAdd ? 'bg-blue-50' : 'bg-white'
                            }`}
                            onClick={() => handleDateSelect(date)}
                            onDoubleClick={() => handleDateDoubleClick(date)}
                          />
                        ))}

                        {/* 予定と除外日のバー */}
                        <div className="absolute inset-0 pointer-events-none">
                          {layoutItems.map((layoutItem) => {
                            const { item, width, left, zIndex } = layoutItem

                            if (item.type === 'exclusion') {
                              const exclusion = item.data
                              const position = getExclusionPosition(exclusion)
                              return (
                                <div
                                  key={`exclusion-${exclusion.id}`}
                                  className="absolute rounded-md border-2 border-dashed border-red-500 bg-red-50 shadow-sm pointer-events-auto"
                                  style={{
                                    top: position.top,
                                    height: position.height,
                                    left: `calc(0.25rem + ${left})`,
                                    width: `calc(${width} - 0.5rem)`,
                                    zIndex: zIndex
                                  }}
                                  title={`除外日: ${exclusion.contractor} - ${exclusion.teamName} - ${exclusion.reason}`}
                                >
                                  <div className="p-1 text-xs">
                                    <div className="flex items-center space-x-1">
                                      <span className="text-red-700 font-bold">🚫</span>
                                      <span className="font-bold text-red-800 truncate">{exclusion.contractor} - {exclusion.teamName}</span>
                                    </div>
                                    <div className="text-red-700 font-medium truncate">{getTimeLabel(exclusion)}</div>
                                    <div className="text-red-600 truncate italic">{exclusion.reason}</div>
                                  </div>
                                </div>
                              )
                            } else {
                              const schedule = item.data
                              const position = getSchedulePosition(schedule.timeSlot)
                              return (
                                <div
                                  key={schedule.id}
                                  className={`absolute rounded-md border shadow-sm cursor-pointer pointer-events-auto ${getContractorBarColor(schedule.contractor)}`}
                                  style={{
                                    top: position.top,
                                    height: position.height,
                                    left: `calc(0.25rem + ${left})`,
                                    width: `calc(${width} - 0.5rem)`,
                                    zIndex: zIndex
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditSchedule(schedule)
                                  }}
                                >
                                  <div className="p-1 text-xs">
                                    <div className="font-medium truncate">{schedule.customerName}</div>
                                    <div className="truncate opacity-90">{schedule.workType}</div>
                                    <div className="truncate opacity-75">{schedule.address}</div>
                                    <div className="truncate opacity-75">{schedule.timeSlot}</div>
                                  </div>
                                </div>
                              )
                            }
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 日表示 - 列分けレイアウト */}
          {viewMode === 'day' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {/* ヘッダー */}
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  {formatDate(currentDate)} の詳細スケジュール
                </h3>
              </div>

              {/* 列がない場合のメッセージ */}
              {visibleColumns.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  フィルターで全ての班が非表示になっています。
                  <br />
                  表示フィルターから班を選択してください。
                </div>
              ) : (
                <div className="relative overflow-x-auto">
                  <div className="flex min-w-full">
                    {/* 時間列（左固定） */}
                    <div className="sticky left-0 z-20 bg-gray-50 border-r-2 border-gray-300" style={{ width: '3.75rem', minWidth: '3.75rem' }}>
                      {/* ヘッダー */}
                      <div className="border-b-2 border-gray-300 flex items-center justify-center" style={{ height: '4rem' }}>
                        <span className="text-xs font-semibold text-gray-600">時間</span>
                      </div>
                      {/* 時間スロット */}
                      {getTimeSlots().map((time) => (
                        <div key={time} className="border-b border-gray-200 flex items-center justify-center" style={{ height: `${HOUR_HEIGHT}rem` }}>
                          <span className="text-xs font-medium text-gray-700">{time}</span>
                        </div>
                      ))}
                    </div>

                    {/* 班列（スクロール可能） */}
                    {visibleColumns.map((column) => {
                      const columnSchedules = schedulesByColumn[column.teamId] || []
                      const columnExclusions = exclusionsByColumn[column.teamId] || []
                      const config = getColumnWidthConfig

                      return (
                        <div
                          key={column.teamId}
                          style={{
                            minWidth: config.minWidth,
                            flex: config.useFlex ? 1 : 'none'
                          }}
                        >
                          {/* 列ヘッダー */}
                          <div className="h-16 border-b-2 border-r border-gray-300 bg-white p-2 flex flex-col items-center justify-center">
                            <div className="flex items-center space-x-1 mb-0.5">
                              <div className={`w-2 h-2 rounded-full bg-${column.color}-500`} />
                              <span className="text-xs font-semibold text-gray-700 truncate">
                                {column.contractorName}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 truncate">
                              {column.teamName}
                            </span>
                          </div>

                          {/* 時間スロット（セル） */}
                          <div className="relative" style={{ height: `${HOUR_HEIGHT * (BUSINESS_END_HOUR - BUSINESS_START_HOUR + 1)}rem` }}>
                            {/* グリッド線 */}
                            {getTimeSlots().map((time) => (
                              <div
                                key={time}
                                className="absolute w-full border-b border-r border-gray-100"
                                style={{
                                  top: `${getTimeSlots().indexOf(time) * HOUR_HEIGHT}rem`,
                                  height: `${HOUR_HEIGHT}rem`
                                }}
                              />
                            ))}

                            {/* 除外日バー */}
                            {columnExclusions.map((exclusion, index) => (
                              <div
                                key={`exclusion-${exclusion.id}`}
                                className="absolute left-0 right-0 bg-red-50 border-2 border-dashed border-red-500 p-2 shadow-sm cursor-default hover:shadow-md transition-shadow"
                                style={{
                                  top: calculateExclusionTop(exclusion),
                                  height: calculateExclusionHeight(exclusion),
                                  zIndex: 10 + index
                                }}
                                title={`除外日: ${getTimeLabel(exclusion)} - ${exclusion.reason}`}
                              >
                                <div className="text-xs text-red-700 font-bold flex items-center space-x-1">
                                  <span>🚫</span>
                                  <span>{getTimeLabel(exclusion)}</span>
                                </div>
                                <div className="text-xs text-red-600 italic truncate mt-1">
                                  {exclusion.reason}
                                </div>
                              </div>
                            ))}

                            {/* スケジュールバー */}
                            {columnSchedules.map((schedule, index) => {
                              const scheduleHeight = calculateScheduleHeight(schedule.timeSlot)
                              const heightValue = parseFloat(scheduleHeight)

                              return (
                                <div
                                  key={schedule.id}
                                  className={`absolute left-0 right-0 rounded border-l-4 shadow-sm cursor-pointer hover:shadow-lg hover:z-50 transition-all ${getContractorColor(schedule.contractor)}`}
                                  style={{
                                    top: calculateScheduleTop(schedule.timeSlot),
                                    height: scheduleHeight,
                                    zIndex: 1 + index,
                                    borderLeftColor: `var(--${column.color}-600)`
                                  }}
                                  onClick={() => handleEditSchedule(schedule)}
                                >
                                  <div className="p-2 h-full overflow-hidden">
                                    <div className="text-xs font-bold truncate">{schedule.customerName}</div>
                                    <div className="text-xs opacity-90 truncate">{schedule.workType}</div>
                                    {heightValue > 3 && (
                                    <>
                                      <div className="text-xs opacity-75 truncate mt-0.5">{schedule.address}</div>
                                      <div className="text-xs opacity-75 truncate">{schedule.timeSlot}</div>
                                    </>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* 右端スクロールヒント */}
                  {visibleColumns.length > 4 && (
                    <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                  )}
                </div>
              )}
            </div>
          )}

        </main>

        {/* 編集モーダル */}
        {showEditModal && editingSchedule && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  スケジュール編集 - {editingSchedule.customerName}
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* 詳細情報セクション */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">詳細情報</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">顧客コード</label>
                      <div className="text-sm text-gray-900">{editingSchedule.orderNumber}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">名前</label>
                      <div className="text-sm text-gray-900">{editingSchedule.customerName}</div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">場所</label>
                      <div className="text-sm text-gray-900">{editingSchedule.address}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">工事班</label>
                      <div className="text-sm text-gray-900">{editingSchedule.contractor}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">工事内容</label>
                      <div className="text-sm text-gray-900">{editingSchedule.workType}</div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">時間</label>
                      <div className="text-sm text-gray-900">{editingSchedule.timeSlot}</div>
                    </div>
                  </div>
                </div>

                {/* 編集セクション */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">工事日</label>
                    <input
                      type="date"
                      value={editingSchedule.assignedDate}
                      onChange={(e) => setEditingSchedule({...editingSchedule, assignedDate: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">開始時刻</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">終了時刻</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">担当業者</label>
                    <select
                      value={editingSchedule.contractor}
                      onChange={(e) => setEditingSchedule({...editingSchedule, contractor: e.target.value as typeof contractors[number]})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                    >
                      {contractors.map(contractor => (
                        <option key={contractor} value={contractor}>{contractor}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ステータス</label>
                    <select
                      value={editingSchedule.status}
                      onChange={(e) => setEditingSchedule({...editingSchedule, status: e.target.value as typeof statuses[number]})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">備考</label>
                  <textarea
                    value={editingSchedule.memo || ''}
                    onChange={(e) => setEditingSchedule({...editingSchedule, memo: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveSchedule}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 新規登録モーダル */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  新規スケジュール登録
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setSelectedDateForAdd(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">受注番号</label>
                    <input
                      type="text"
                      value={newSchedule.orderNumber || ''}
                      onChange={(e) => setNewSchedule({...newSchedule, orderNumber: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                      placeholder="自動生成されます"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">顧客名 *</label>
                    <input
                      type="text"
                      value={newSchedule.customerName || ''}
                      onChange={(e) => setNewSchedule({...newSchedule, customerName: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">住所 *</label>
                  <input
                    type="text"
                    value={newSchedule.address || ''}
                    onChange={(e) => setNewSchedule({...newSchedule, address: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">工事内容</label>
                  <select
                    value={newSchedule.workType || ''}
                    onChange={(e) => setNewSchedule({...newSchedule, workType: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                  >
                    <option value="個別対応">個別対応</option>
                    <option value="HCNA技術人工事">HCNA技術人工事</option>
                    <option value="G・6ch追加人工事">G・6ch追加人工事</option>
                    <option value="放送波人工事">放送波人工事</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">工事日</label>
                    <input
                      type="date"
                      value={newSchedule.assignedDate}
                      onChange={(e) => setNewSchedule({...newSchedule, assignedDate: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">開始時刻</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">終了時刻</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">担当業者</label>
                    <select
                      value={newSchedule.contractor}
                      onChange={(e) => setNewSchedule({...newSchedule, contractor: e.target.value as typeof contractors[number]})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                    >
                      {contractors.map(contractor => (
                        <option key={contractor} value={contractor}>{contractor}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">備考</label>
                  <textarea
                    value={newSchedule.memo || ''}
                    onChange={(e) => setNewSchedule({...newSchedule, memo: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setSelectedDateForAdd(null)
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveNewSchedule}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={!newSchedule.customerName || !newSchedule.address}
                >
                  登録
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}