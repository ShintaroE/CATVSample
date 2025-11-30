/**
 * 工事依頼関連サンプルデータ
 *
 * 工事依頼のサンプルデータを管理
 */

import type { OrderData } from '@/app/orders/types'

// ========================================
// 工事依頼サンプルデータ
// ========================================

export const sampleOrders: OrderData[] = [
  {
    orderNumber: 'ORD-2025-001',
    orderSource: '新規受付',
    constructionCategory: '個別',
    workType: '個別',
    customerCode: 'C001',
    customerType: '新規',
    customerName: '山田太郎',
    address: '岡山県倉敷市○○町1-2-3',
    phoneNumber: '086-123-4567',
    surveyStatus: '未依頼',
    permissionStatus: '不要',
    constructionStatus: '未着手',
    appointmentHistory: [],
    orderStatus: 'アクティブ',
  },
  {
    orderNumber: 'ORD-2025-002',
    orderSource: 'Web申込',
    constructionCategory: '個別',
    workType: 'マンションタイプ光工事',
    customerCode: 'C002',
    customerType: '既存',
    customerName: '佐藤花子',
    address: '岡山県倉敷市△△町4-5-6',
    phoneNumber: '086-234-5678',
    surveyStatus: '依頼済み',
    permissionStatus: '不要',
    constructionStatus: '未着手',
    appointmentHistory: [],
    orderStatus: 'アクティブ',
  },
  {
    orderNumber: 'ORD-2025-003',
    orderSource: '電話受付',
    constructionCategory: '集合',
    workType: 'HCNA一括導入工事',
    collectiveCode: 'APT002',
    collectiveHousingName: 'グランドメゾン水島',
    customerCode: 'C003',
    customerType: '新規',
    customerName: '鈴木一郎',
    address: '岡山県倉敷市水島××町7-8-9',
    phoneNumber: '086-345-6789',
    surveyStatus: '完了',
    permissionStatus: '申請中',
    constructionStatus: '未着手',
    collectiveConstructionInfo: {
      floors: 5,
      units: 20,
      advanceMaterialPrinting: 'required',
    },
    appointmentHistory: [],
    orderStatus: 'アクティブ',
  },
]
