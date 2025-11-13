import { useCallback } from 'react'
import { ExclusionEntry, WeekViewColumn, TeamGroup, TeamFilter, DayColumn, TeamColumnInDay } from '../types'
import { HOUR_HEIGHT, BUSINESS_START_HOUR, BUSINESS_END_HOUR } from '../types'

export function useScheduleLayout(
  teamFilters: TeamFilter[],
  currentDate: Date,
  formatDateString: (date: Date) => string,
  formatDate: (date: Date) => string
) {
  // 週の日付を取得
  const getWeekDays = useCallback(() => {
    const startOfWeek = new Date(currentDate)
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
  }, [currentDate])

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

  // スケジュールの開始位置を計算（rem）
  const calculateScheduleTop = useCallback((timeSlot: string): string => {
    if (timeSlot === '終日') return '0rem'

    const [startTime] = timeSlot.split('-')
    if (!startTime) return '0rem'

    const [hour, minute] = startTime.split(':').map(Number)
    const minutesFromStart = (hour - BUSINESS_START_HOUR) * 60 + minute
    return `${(minutesFromStart / 60) * HOUR_HEIGHT}rem`
  }, [])

  // スケジュールの高さを計算（rem）
  const calculateScheduleHeight = useCallback((timeSlot: string): string => {
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

    return `${Math.max((durationMinutes / 60) * HOUR_HEIGHT, 2)}rem`
  }, [])

  // 除外日の開始位置を計算（rem）
  const calculateExclusionTop = useCallback((exclusion: ExclusionEntry): string => {
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
  }, [])

  // 除外日の高さを計算（rem）
  const calculateExclusionHeight = useCallback((exclusion: ExclusionEntry): string => {
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
  }, [])

  // 時間スロット配列を生成
  const getTimeSlots = useCallback(() => {
    const slots = []
    for (let hour = BUSINESS_START_HOUR; hour <= BUSINESS_END_HOUR; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
    }
    return slots
  }, [])

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
        // 短縮名を生成（例: "直営班-A班" → "直A"）
        const contractorShort =
          team.contractorName === '直営班' ? '直' :
          team.contractorName === '栄光電気' ? '栄' :
          team.contractorName === 'スライヴ' ? 'ス' :
          team.contractorName.substring(0, 1)
        const teamShort = team.teamName.replace('班', '').replace('第', '')
        const shortName = `${contractorShort}${teamShort}`

        columns.push({
          day,
          team: {
            teamId: team.teamId,
            teamName: team.teamName,
            contractorName: team.contractorName,
            contractorId: team.contractorId,
            color: team.color,
            displayName: `${team.contractorName}-${team.teamName}`,
            shortName
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
    getWeekDays,
    getWeekRangeLabel,
    getTeamGroups,
    getWeekViewColumns,
    getColumnWidth,
    calculateScheduleTop,
    calculateScheduleHeight,
    calculateExclusionTop,
    calculateExclusionHeight,
    getTimeSlots,
    // 日付軸ビュー用の新しいメソッド
    getWeekDayColumns,
    getWeekColumnsByDate,
    getTeamColumnWidth,
  }
}

