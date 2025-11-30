import { useState, useEffect, useCallback, useMemo } from 'react'
import { getContractors, getTeams } from '@/features/contractor/lib/contractorStorage'
import { TeamFilter, ScheduleItem, ExclusionEntry, ScheduleItemWithTeam, ScheduleType, ScheduleTypeFilter } from '@/features/calendar/types'
import { getContractorColorName } from '@/lib/contractorColors'

// Re-export ScheduleTypeFilter for backward compatibility
export type { ScheduleTypeFilter }

export function useFilters(schedules: ScheduleItem[], exclusions: ExclusionEntry[]) {
  const [teamFilters, setTeamFilters] = useState<TeamFilter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [scheduleTypeFilter, setScheduleTypeFilter] = useState<ScheduleTypeFilter>({
    construction: true,
    survey: true,
  })
  const [isScheduleTypeFilterOpen, setIsScheduleTypeFilterOpen] = useState(false)

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
    setIsLoading(false)
  }, [])

  const getContractorCheckState = useCallback((contractorId: string): 'all' | 'some' | 'none' => {
    const contractorFilters = teamFilters.filter(f => f.contractorId === contractorId)
    if (contractorFilters.length === 0) return 'none'

    const visibleCount = contractorFilters.filter(f => f.isVisible).length

    if (visibleCount === 0) return 'none'
    if (visibleCount === contractorFilters.length) return 'all'
    return 'some'
  }, [teamFilters])

  const getContractorGroups = useCallback(() => {
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
  }, [teamFilters, getContractorCheckState])

  const handleToggleAll = useCallback((checked: boolean) => {
    setTeamFilters(prev =>
      prev.map(filter => ({ ...filter, isVisible: checked }))
    )
  }, [])

  const handleToggleContractor = useCallback((contractorId: string, checked: boolean) => {
    setTeamFilters(prev =>
      prev.map(filter =>
        filter.contractorId === contractorId
          ? { ...filter, isVisible: checked }
          : filter
      )
    )
  }, [])

  const handleToggleTeam = useCallback((teamId: string, checked: boolean) => {
    setTeamFilters(prev =>
      prev.map(filter =>
        filter.teamId === teamId
          ? { ...filter, isVisible: checked }
          : filter
      )
    )
  }, [])

  // 種別フィルタのトグル
  const handleToggleScheduleType = useCallback((type: ScheduleType) => {
    setScheduleTypeFilter(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }, [])

  // フィルタリング済みデータ
  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      // 種別フィルタ
      if (!scheduleTypeFilter[schedule.scheduleType]) {
        return false
      }

      // 担当班フィルタ
      if (teamFilters.length === 0) return true
      return schedule.assignedTeams.some(assignedTeam =>
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

  // スケジュールを班ごとに展開する関数
  const expandSchedulesByTeams = useCallback((schedulesToExpand: ScheduleItem[]): ScheduleItemWithTeam[] => {
    const expanded: ScheduleItemWithTeam[] = []

    schedulesToExpand.forEach(schedule => {
      const visibleTeams = schedule.assignedTeams.filter(team =>
        teamFilters.length === 0 || teamFilters.some(f => f.teamId === team.teamId && f.isVisible)
      )

      if (visibleTeams.length === 0 && schedule.assignedTeams.length === 0) {
        expanded.push({
          ...schedule,
          displayTeam: {
            contractorId: schedule.contractorId,
            contractorName: schedule.contractor,
            teamId: schedule.teamId || '',
            teamName: schedule.teamName || ''
          }
        })
      } else {
        visibleTeams.forEach(team => {
          expanded.push({
            ...schedule,
            displayTeam: team
          })
        })
      }
    })

    return expanded
  }, [teamFilters])

  return {
    teamFilters,
    isLoading,
    isFilterPanelOpen,
    setIsFilterPanelOpen,
    getContractorCheckState,
    getContractorGroups,
    handleToggleAll,
    handleToggleContractor,
    handleToggleTeam,
    scheduleTypeFilter,
    isScheduleTypeFilterOpen,
    setIsScheduleTypeFilterOpen,
    handleToggleScheduleType,
    filteredSchedules,
    filteredExclusions,
    expandSchedulesByTeams,
  }
}

