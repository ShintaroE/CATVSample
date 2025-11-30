/**
 * スケジュール・除外日関連サンプルデータ
 *
 * 工事スケジュール、現地調査スケジュール、除外日のサンプルデータを管理
 */

import type { ExclusionEntry } from '@/features/calendar/types'

// ========================================
// 除外日サンプルデータ
// ========================================

export const sampleExclusions: ExclusionEntry[] = [
  {
    id: 'excl-1',
    date: '2025-01-15',
    reason: '他現場対応',
    contractor: '直営班',
    contractorId: 'contractor-1',
    teamId: 'team-1',
    teamName: 'A班',
    timeType: 'all_day',
  },
  {
    id: 'excl-2',
    date: '2025-01-20',
    reason: '休暇',
    contractor: '栄光電気通信',
    contractorId: 'contractor-2',
    teamId: 'team-3',
    teamName: '1班',
    timeType: 'pm',
  },
  {
    id: 'excl-3',
    date: '2025-01-22',
    reason: '定期メンテナンス',
    contractor: '直営班',
    contractorId: 'contractor-1',
    teamId: 'team-2',
    teamName: 'B班',
    timeType: 'am',
  },
]
