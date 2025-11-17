import { useState, useMemo, useEffect, useCallback } from 'react'
import { getContractors, getTeams } from '@/features/contractor/lib/contractorStorage'
import { TeamFilter, CalendarViewMode, WeekViewColumn, TeamGroup, DayColumn, TeamColumnInDay, ScheduleTypeFilter } from '../types'
import { sampleExclusions } from '../data/sampleData'
import { getContractorColorName } from '@/shared/utils/contractorColors'
import { scheduleStorage } from '@/app/schedule/lib/scheduleStorage'
import { ScheduleItem, ExclusionEntry, ScheduleType } from '@/app/schedule/types'

export function useScheduleViewer() {
  const [calendarViewMode, setCalendarViewMode] = useState<CalendarViewMode>('month')
  const [teamFilters, setTeamFilters] = useState<TeamFilter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  const [exclusions, setExclusions] = useState<ExclusionEntry[]>([])
  const [scheduleTypeFilter, setScheduleTypeFilter] = useState<ScheduleTypeFilter>({
    construction: true,
    survey: true,
  })
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [scheduleCalendarDate, setScheduleCalendarDate] = useState<Date>(new Date())
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<string | null>(null)

  // フィルター初期化とデータ読み込み
  useEffect(() => {
    const contractors = getContractors()
    const teams = getTeams()

    const filters: TeamFilter[] = teams.map(team => {
      const contractor = contractors.find(c => c.id === team.contractorId)
      const contractorName = contractor?.name || ''
      return {
        contractorId: team.contractorId,
        contractorName,
        teamId: team.id,
        teamName: team.teamName,
        isVisible: true,
        color: getContractorColorName(contractorName)
      }
    })

    // localStorageからスケジュールを読み込み
    const storedSchedules = scheduleStorage.getAll()
    setSchedules(storedSchedules)

    // 除外日は既存のサンプルデータを維持
    setExclusions(sampleExclusions)

    setTeamFilters(filters)
    setIsLoading(false)
  }, [])

  // 日付フォーマット関数
  const formatDateString = useCallback((date: Date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])

  const formatDate = useCallback((date: Date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekDays = ['日', '月', '火', '水', '木', '金', '土']
    const weekDay = weekDays[date.getDay()]
    return `${month}/${day}(${weekDay})`
  }, [])

  // 週の日付を取得
  const getWeekDays = useCallback(() => {
    const startOfWeek = new Date(scheduleCalendarDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)

    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      days.push(date)
    }
    return days
  }, [scheduleCalendarDate])

  // 週範囲表示用のラベルを取得
  const getWeekRangeLabel = useCallback((): string => {
    const weekDays = getWeekDays()
    const startDate = weekDays[0]
    const endDate = weekDays[6]

    const startMonth = startDate.getMonth() + 1
    const startDay = startDate.getDate()
    const endMonth = endDate.getMonth() + 1
    const endDay = endDate.getDate()
    const year = startDate.getFullYear()

    if (startMonth === endMonth) {
      return `${year}年${startMonth}月${startDay}日 - ${endDay}日`
    }
    return `${year}年${startMonth}月${startDay}日 - ${endMonth}月${endDay}日`
  }, [getWeekDays])

  // 週表示用: 班グループを取得
  const getTeamGroups = useCallback((): TeamGroup[] => {
    return teamFilters
      .filter(f => f.isVisible)
      .map(f => ({
        teamId: f.teamId,
        teamName: f.teamName,
        contractorName: f.contractorName,
        color: f.color,
        displayName: `${f.contractorName}-${f.teamName}`,
        columnCount: 7
      }))
  }, [teamFilters])

  // 週表示用: 列を取得
  const getWeekViewColumns = useCallback((): WeekViewColumn[] => {
    const columns: WeekViewColumn[] = []
    const visibleTeams = teamFilters.filter(f => f.isVisible)
    const weekDays = getWeekDays()

    visibleTeams.forEach(team => {
      weekDays.forEach(date => {
        columns.push({
          teamId: team.teamId,
          teamName: team.teamName,
          contractorId: team.contractorId,
          contractorName: team.contractorName,
          color: team.color,
          date,
          dateStr: formatDateString(date),
          displayName: formatDate(date),
          teamDisplayName: `${team.contractorName}-${team.teamName}`
        })
      })
    })

    return columns
  }, [teamFilters, getWeekDays, formatDateString, formatDate])

  // 週表示用: 列幅を計算
  const getColumnWidth = useCallback((visibleTeamCount: number): string => {
    if (visibleTeamCount === 1) return '150px'
    if (visibleTeamCount === 2) return '120px'
    if (visibleTeamCount === 3) return '100px'
    return '90px'
  }, [])

  // フィルタリング済みデータ
  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      // 種別フィルタ
      if (!scheduleTypeFilter[schedule.scheduleType]) {
        return false
      }

      // 班フィルタ
      if (teamFilters.length === 0) return true
      return schedule.assignedTeams?.some(assignedTeam =>
        teamFilters.some(f => f.teamId === assignedTeam.teamId && f.isVisible)
      )
    })
  }, [schedules, teamFilters, scheduleTypeFilter])

  const filteredExclusions = useMemo(() => {
    return exclusions.filter(exclusion => {
      if (teamFilters.length === 0) return true
      return teamFilters.some(f => f.teamId === exclusion.teamId && f.isVisible)
    })
  }, [exclusions, teamFilters])

  const visibleFilterCount = teamFilters.filter(f => f.isVisible).length
  const totalFilterCount = teamFilters.length

  // フィルター関連の関数
  const getContractorCheckState = useCallback((contractorId: string): 'all' | 'some' | 'none' => {
    const contractorTeams = teamFilters.filter(f => f.contractorId === contractorId)
    const visibleCount = contractorTeams.filter(f => f.isVisible).length

    if (visibleCount === 0) return 'none'
    if (visibleCount === contractorTeams.length) return 'all'
    return 'some'
  }, [teamFilters])

  const handleToggleAll = useCallback((checked: boolean) => {
    setTeamFilters(prev => prev.map(f => ({ ...f, isVisible: checked })))
  }, [])

  const handleToggleContractor = useCallback((contractorId: string, checked: boolean) => {
    setTeamFilters(prev =>
      prev.map(f => f.contractorId === contractorId ? { ...f, isVisible: checked } : f)
    )
  }, [])

  const handleToggleTeam = useCallback((teamId: string, checked: boolean) => {
    setTeamFilters(prev =>
      prev.map(f => f.teamId === teamId ? { ...f, isVisible: checked } : f)
    )
  }, [])

  // 種別フィルタートグル
  const handleToggleScheduleType = useCallback((type: ScheduleType) => {
    setScheduleTypeFilter(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }, [])

  // カレンダーナビゲーション
  const navigateScheduleMonth = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(scheduleCalendarDate)
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    setScheduleCalendarDate(newDate)
  }, [scheduleCalendarDate])

  const navigateScheduleWeek = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(scheduleCalendarDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    setScheduleCalendarDate(newDate)
  }, [scheduleCalendarDate])

  const handleScheduleDateClick = useCallback((date: Date) => {
    const dateStr = formatDateString(date)
    setSelectedScheduleDate(dateStr)
  }, [formatDateString])

  // 日付軸ビュー用: 週の日付列を取得
  const getWeekDayColumns = useCallback((): DayColumn[] => {
    const weekDays = getWeekDays()
    return weekDays.map(date => ({
      date,
      dateStr: formatDateString(date),
      displayName: formatDate(date),
      dayOfWeek: date.getDay()
    }))
  }, [getWeekDays, formatDateString, formatDate])

  // 日付軸ビュー用: 日付×班の列を取得
  const getWeekColumnsByDate = useCallback((): TeamColumnInDay[] => {
    const dayColumns = getWeekDayColumns()
    const visibleTeams = teamFilters.filter(f => f.isVisible)

    const columns: TeamColumnInDay[] = []

    dayColumns.forEach(day => {
      visibleTeams.forEach(team => {
        columns.push({
          day,
          team: {
            teamId: team.teamId,
            teamName: team.teamName,
            contractorName: team.contractorName,
            contractorId: team.contractorId,
            color: team.color,
            displayName: `${team.contractorName}-${team.teamName}`
          }
        })
      })
    })

    return columns
  }, [getWeekDayColumns, teamFilters])

  // 日付軸ビュー用: 班の列幅を計算
  const getTeamColumnWidth = useCallback((teamsCount: number): string => {
    if (teamsCount <= 3) return '120px'
    if (teamsCount <= 5) return '100px'
    return '80px'
  }, [])

  return {
    calendarViewMode,
    setCalendarViewMode,
    teamFilters,
    isLoading,
    scheduleTypeFilter,
    showFilterPanel,
    setShowFilterPanel,
    scheduleCalendarDate,
    selectedScheduleDate,
    setSelectedScheduleDate,
    formatDateString,
    formatDate,
    getWeekDays,
    getWeekRangeLabel,
    getTeamGroups,
    getWeekViewColumns,
    getColumnWidth,
    filteredSchedules,
    filteredExclusions,
    visibleFilterCount,
    totalFilterCount,
    getContractorCheckState,
    handleToggleAll,
    handleToggleContractor,
    handleToggleTeam,
    handleToggleScheduleType,
    navigateScheduleMonth,
    navigateScheduleWeek,
    handleScheduleDateClick,
    // 日付軸ビュー用の新しいメソッド
    getWeekDayColumns,
    getWeekColumnsByDate,
    getTeamColumnWidth,
  }
}

