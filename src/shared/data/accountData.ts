/**
 * アカウント関連サンプルデータ
 *
 * 管理者、協力会社、班のサンプルデータを管理
 */

import type { Admin, Contractor, Team } from '@/features/contractor/types'

// ========================================
// 管理者サンプルデータ
// ========================================

export const sampleAdmins: Admin[] = [
  {
    id: 'admin-1',
    name: 'KCT管理者',
    username: 'admin',
    password: 'admin',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
]

// ========================================
// 協力会社サンプルデータ
// ========================================

export const sampleContractors: Contractor[] = [
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

// ========================================
// 班サンプルデータ
// ========================================

export const sampleTeams: Team[] = [
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
