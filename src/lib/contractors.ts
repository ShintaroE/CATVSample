import { Contractor, Team } from '@/types/contractor'

// ローカルストレージのキー
const CONTRACTORS_KEY = 'contractors'
const TEAMS_KEY = 'teams'

// 協力会社の取得
export const getContractors = (): Contractor[] => {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(CONTRACTORS_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to load contractors:', error)
    return []
  }
}

// 協力会社の保存
export const saveContractors = (contractors: Contractor[]): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CONTRACTORS_KEY, JSON.stringify(contractors))
  } catch (error) {
    console.error('Failed to save contractors:', error)
  }
}

// 協力会社の追加
export const addContractor = (contractor: Contractor): void => {
  const contractors = getContractors()
  contractors.push(contractor)
  saveContractors(contractors)
}

// 協力会社の更新
export const updateContractor = (id: string, updates: Partial<Contractor>): void => {
  const contractors = getContractors()
  const index = contractors.findIndex(c => c.id === id)
  if (index !== -1) {
    contractors[index] = { ...contractors[index], ...updates }
    saveContractors(contractors)
  }
}

// 協力会社の削除
export const deleteContractor = (id: string): void => {
  const contractors = getContractors()
  const filtered = contractors.filter(c => c.id !== id)
  saveContractors(filtered)

  // 関連する班も削除
  const teams = getTeams()
  const filteredTeams = teams.filter(t => t.contractorId !== id)
  saveTeams(filteredTeams)
}

// IDで協力会社を取得
export const getContractorById = (id: string): Contractor | undefined => {
  const contractors = getContractors()
  return contractors.find(c => c.id === id)
}

// ユーザー名で協力会社を取得
export const getContractorByUsername = (username: string): Contractor | undefined => {
  const contractors = getContractors()
  return contractors.find(c => c.username === username)
}

// 班の取得
export const getTeams = (): Team[] => {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(TEAMS_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to load teams:', error)
    return []
  }
}

// 班の保存
export const saveTeams = (teams: Team[]): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(TEAMS_KEY, JSON.stringify(teams))
  } catch (error) {
    console.error('Failed to save teams:', error)
  }
}

// 班の追加
export const addTeam = (team: Team): void => {
  const teams = getTeams()
  teams.push(team)
  saveTeams(teams)
}

// 班の更新
export const updateTeam = (id: string, updates: Partial<Team>): void => {
  const teams = getTeams()
  const index = teams.findIndex(t => t.id === id)
  if (index !== -1) {
    teams[index] = { ...teams[index], ...updates }
    saveTeams(teams)
  }
}

// 班の削除
export const deleteTeam = (id: string): void => {
  const teams = getTeams()
  const filtered = teams.filter(t => t.id !== id)
  saveTeams(filtered)
}

// 協力会社IDで班を取得
export const getTeamsByContractorId = (contractorId: string): Team[] => {
  const teams = getTeams()
  return teams.filter(t => t.contractorId === contractorId && t.isActive)
}

// IDで班を取得
export const getTeamById = (id: string): Team | undefined => {
  const teams = getTeams()
  return teams.find(t => t.id === id)
}

// 初期データのセットアップ（既存のデータがない場合のみ）
export const initializeDefaultData = (): void => {
  const existingContractors = getContractors()
  if (existingContractors.length > 0) return

  // デフォルトの協力会社データ
  const defaultContractors: Contractor[] = [
    {
      id: 'contractor-1',
      name: '直営班',
      username: 'chokueihan',
      password: 'password',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: 'contractor-2',
      name: '栄光電気通信',
      username: 'eiko',
      password: 'password',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: 'contractor-3',
      name: 'スライヴ',
      username: 'thrive',
      password: 'password',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
  ]

  // デフォルトの班データ
  const defaultTeams: Team[] = [
    {
      id: 'team-1',
      contractorId: 'contractor-1',
      teamName: 'A班',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: 'team-2',
      contractorId: 'contractor-1',
      teamName: 'B班',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: 'team-3',
      contractorId: 'contractor-2',
      teamName: '1班',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: 'team-4',
      contractorId: 'contractor-3',
      teamName: '第1班',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
  ]

  saveContractors(defaultContractors)
  saveTeams(defaultTeams)
}
