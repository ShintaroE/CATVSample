import { ExclusionEntry, ScheduleData, OrderData } from '../types'

export const sampleExclusions: ExclusionEntry[] = [
  {
    id: 'e1',
    date: '2025-09-30',
    reason: '社員研修',
    contractor: '栄光電気',
    contractorId: 'contractor-2',
    teamId: 'team-3',
    teamName: '1班',
    timeType: 'all_day',
  },
  {
    id: 'e2',
    date: '2025-10-01',
    reason: '定期メンテナンス',
    contractor: 'スライヴ',
    contractorId: 'contractor-3',
    teamId: 'team-4',
    teamName: '第1班',
    timeType: 'am',
  },
  {
    id: 'e3',
    date: '2025-10-02',
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

export const sampleSchedules: ScheduleData[] = [
  {
    assignedDate: '2025-09-29',
    timeSlot: '09:00-12:00',
    contractor: '直営班',
    contractorId: 'contractor-1',
    teamId: 'team-1',
    teamName: 'A班',
    assignedTeams: [
      { contractorId: 'contractor-1', contractorName: '直営班', teamId: 'team-1', teamName: 'A班' }
    ],
    status: '予定',
    customerCode: '2025091000001',
    customerName: '田中太郎',
    address: '倉敷市水島青葉町1-1-1',
    workType: '個別対応'
  },
  {
    assignedDate: '2025-09-29',
    timeSlot: '13:00-17:00',
    contractor: '栄光電気',
    contractorId: 'contractor-2',
    teamId: 'team-3',
    teamName: '1班',
    assignedTeams: [
      { contractorId: 'contractor-2', contractorName: '栄光電気', teamId: 'team-3', teamName: '1班' }
    ],
    status: '作業中',
    customerCode: '2025091000002',
    customerName: '山田花子',
    address: '倉敷市中央2-5-8',
    workType: 'HCNA技術人工事'
  },
  {
    assignedDate: '2025-09-30',
    timeSlot: '09:00-12:00',
    contractor: 'スライヴ',
    contractorId: 'contractor-3',
    teamId: 'team-4',
    teamName: '第1班',
    assignedTeams: [
      { contractorId: 'contractor-3', contractorName: 'スライヴ', teamId: 'team-4', teamName: '第1班' }
    ],
    status: '予定',
    customerCode: '2025091000003',
    customerName: '佐藤花子',
    address: '倉敷市児島駅前2-2-2',
    workType: 'HCNA技術人工事'
  },
  {
    assignedDate: '2025-10-01',
    timeSlot: '10:00-15:00',
    contractor: '直営班',
    contractorId: 'contractor-1',
    teamId: 'team-2',
    teamName: 'B班',
    assignedTeams: [
      { contractorId: 'contractor-1', contractorName: '直営班', teamId: 'team-2', teamName: 'B班' }
    ],
    status: '予定',
    customerCode: '2025091000004',
    customerName: '山田次郎',
    address: '倉敷市玉島中央町3-3-3',
    workType: 'G・6ch追加人工事'
  },
  {
    assignedDate: '2025-10-02',
    timeSlot: '09:00-11:00',
    contractor: '栄光電気',
    contractorId: 'contractor-2',
    teamId: 'team-3',
    teamName: '1班',
    assignedTeams: [
      { contractorId: 'contractor-2', contractorName: '栄光電気', teamId: 'team-3', teamName: '1班' }
    ],
    status: '予定',
    customerCode: '2025091000005',
    customerName: '鈴木一郎',
    address: '倉敷市連島町1-4-7',
    workType: '放送波人工事'
  },
  {
    assignedDate: '2025-10-02',
    timeSlot: '14:00-16:00',
    contractor: 'スライヴ',
    contractorId: 'contractor-3',
    teamId: 'team-4',
    teamName: '第1班',
    assignedTeams: [
      { contractorId: 'contractor-3', contractorName: 'スライヴ', teamId: 'team-4', teamName: '第1班' }
    ],
    status: '予定',
    customerCode: '2025091000006',
    customerName: '高橋美咲',
    address: '倉敷市老松町2-8-15',
    workType: '個別対応'
  },
  {
    assignedDate: '2025-10-03',
    timeSlot: '終日',
    contractor: '直営班',
    contractorId: 'contractor-1',
    teamId: 'team-1',
    teamName: 'A班',
    assignedTeams: [
      { contractorId: 'contractor-1', contractorName: '直営班', teamId: 'team-1', teamName: 'A班' }
    ],
    status: '作業中',
    customerCode: '2025091000007',
    customerName: '渡辺健一',
    address: '倉敷市水島工業地帯',
    workType: '大規模回線工事'
  }
]

export const sampleOrders: OrderData[] = [
  {
    orderNumber: '2025092900001',
    orderSource: 'KCT本社',
    workContent: '個別対応',
    customerCode: '123456789',
    customerType: '新規',
    customerName: '田中太郎',
    constructionDate: '2025-09-29',
    closureNumber: 'CL-001-A',
    address: '倉敷市水島青葉町1-1-1',
    phoneNumber: '086-123-4567',
    surveyStatus: 'completed',
    permissionStatus: 'in_progress',
    constructionStatus: 'pending',
    appointmentHistory: [
      {
        id: '1',
        date: '2025-09-25T10:00',
        endTime: '11:00',
        status: '保留',
        content: '詳細検討したい、後日連絡との事'
      },
      {
        id: '2',
        date: '2025-09-27T14:30',
        endTime: '15:30',
        status: '工事決定',
        content: '工事内容に合意、9月29日で調整'
      }
    ]
  },
  {
    orderNumber: '2025093000002',
    orderSource: 'KCT水島',
    workContent: 'HCNAー技術人工事',
    customerCode: '234567890',
    customerType: '既存',
    customerName: '佐藤花子',
    constructionDate: '2025-09-30',
    closureNumber: 'CL-002-B',
    address: '倉敷市児島駅前2-2-2',
    phoneNumber: '086-234-5678',
    surveyStatus: 'completed',
    permissionStatus: 'completed',
    constructionStatus: 'in_progress',
    appointmentHistory: [
      {
        id: '3',
        date: '2025-09-28T09:00',
        endTime: '10:00',
        status: '工事決定',
        content: '工事日程確定、立会い可能'
      }
    ]
  },
  {
    orderNumber: '2025100100003',
    orderSource: 'KCT玉島',
    workContent: 'G・6ch追加人工事',
    customerCode: '345678901',
    customerType: '新規',
    customerName: '山田次郎',
    constructionDate: '2025-10-01',
    closureNumber: 'CL-003-C',
    address: '倉敷市玉島中央町3-3-3',
    phoneNumber: '086-345-6789',
    surveyStatus: 'in_progress',
    permissionStatus: 'pending',
    constructionStatus: 'pending',
    appointmentHistory: [
      {
        id: '4',
        date: '2025-09-26T16:00',
        endTime: '16:30',
        status: '不通',
        content: '電話に出ず、後日再連絡'
      }
    ]
  }
]
