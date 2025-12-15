/**
 * 工事依頼管理画面 CSVエクスポート機能
 *
 * フィルタリングされた工事データと紐づく申請管理データをCSV形式でエクスポートします。
 * 各受注に対して、現地調査・共架添架・工事依頼の3種類の申請データを横展開で出力します。
 * 複数の同一種別申請がある場合は、行を分けて出力します。
 */

import { OrderData } from '../types'
import {
  SurveyRequest,
  AttachmentRequest,
  ConstructionRequest,
} from '@/features/applications/types'

/**
 * 受注データに紐づく申請データを集約
 */
interface AggregatedApplications {
  surveys: SurveyRequest[]
  attachments: AttachmentRequest[]
  constructions: ConstructionRequest[]
}

export function aggregateApplicationsByOrderNumber(
  orderNumber: string,
  surveys: SurveyRequest[],
  attachments: AttachmentRequest[],
  constructions: ConstructionRequest[]
): AggregatedApplications {
  return {
    surveys: surveys.filter(s => s.orderNumber === orderNumber),
    attachments: attachments.filter(a => a.orderNumber === orderNumber),
    constructions: constructions.filter(c => c.orderNumber === orderNumber),
  }
}

/**
 * 進捗履歴から日時を抽出（最新の日時を返す）
 */
function getLatestProgressTimestamp(
  request: SurveyRequest | AttachmentRequest | ConstructionRequest
): string {
  if (!request.progressHistory || request.progressHistory.length === 0) {
    return ''
  }
  const latest = request.progressHistory[request.progressHistory.length - 1]
  return formatDateTime(latest.timestamp)
}

/**
 * OrderDataと申請データをCSV行に変換（横展開形式）
 *
 * 基本情報21列 + 区切り1列 + 現地調査10列 + 区切り1列 + 共架添架10列 + 区切り1列 + 工事依頼10列 = 54列
 */
export function convertOrderToCSVRow(
  order: OrderData,
  survey?: SurveyRequest,
  attachment?: AttachmentRequest,
  construction?: ConstructionRequest
): string[] {
  const baseFields = [
    // 基本情報21列
    order.orderNumber,
    order.orderSource,
    order.constructionCategory,
    order.workType,
    order.customerCode,
    order.customerName,
    order.customerNameKana,
    order.customerType,
    order.phoneNumber || '',
    order.address || '',
    order.constructionDate || '',
    order.closureNumber || '',
    order.collectiveCode || '',
    order.collectiveHousingName || '',
    order.collectiveHousingNameKana || '',
    order.surveyStatus || '',
    order.permissionStatus || '',
    order.constructionStatus || '',
    order.orderStatus || 'アクティブ',
    order.cancelledAt ? formatDateTime(order.cancelledAt) : '',
    order.cancellationReason || ''
  ]

  // 現地調査依頼データ（10列）
  const surveyFields = survey ? [
    survey.serialNumber.toString(),
    survey.status,
    survey.contractorName || '',
    survey.teamName || '',
    survey.scheduledDate || '',
    survey.completedAt || '',
    survey.feasibilityResult?.feasibility || '',
    survey.feasibilityResult?.reportedAt ? formatDateTime(survey.feasibilityResult.reportedAt) : '',
    survey.requestedAt || '',
    getLatestProgressTimestamp(survey)
  ] : Array(10).fill('')

  // 共架・添架依頼データ（10列）
  const attachmentFields = attachment ? [
    attachment.serialNumber.toString(),
    attachment.status,
    attachment.contractorName || '',
    attachment.teamName || '',
    attachment.requestedAt || '',
    attachment.submittedAt || '',
    attachment.approvedAt || '',
    attachment.surveyCompletedAt || '',
    attachment.applicationReport?.reportedAt ? formatDateTime(attachment.applicationReport.reportedAt) : '',
    getLatestProgressTimestamp(attachment)
  ] : Array(10).fill('')

  // 工事依頼データ（10列）
  const constructionFields = construction ? [
    construction.serialNumber.toString(),
    construction.status,
    construction.contractorName || '',
    construction.teamName || '',
    construction.constructionType || '',
    construction.constructionRequestedDate || '',
    construction.constructionDate || '',
    construction.constructionCompletedDate || '',
    construction.constructionDateSetAt ? formatDateTime(construction.constructionDateSetAt) : '',
    getLatestProgressTimestamp(construction)
  ] : Array(10).fill('')

  return [
    ...baseFields,
    '', // セクション区切り
    ...surveyFields,
    '', // セクション区切り
    ...attachmentFields,
    '', // セクション区切り
    ...constructionFields
  ]
}

/**
 * CSV文字列を生成（UTF-8 with BOM）- 申請データを含む横展開形式
 *
 * @param orders エクスポート対象の工事データ配列
 * @param surveys 現地調査依頼データ
 * @param attachments 共架・添架依頼データ
 * @param constructions 工事依頼データ
 * @returns UTF-8 with BOMのCSV文字列
 */
export function generateCSV(
  orders: OrderData[],
  surveys: SurveyRequest[],
  attachments: AttachmentRequest[],
  constructions: ConstructionRequest[]
): string {
  const headers = [
    // 基本情報（21列）
    '受注番号',
    '受注元',
    '個別/集合',
    '工事種別',
    '顧客コード',
    '顧客名',
    '顧客名（カナ）',
    '顧客タイプ',
    '電話番号',
    '住所',
    '工事日',
    'クロージャ番号',
    '集合コード',
    '集合住宅名',
    '集合住宅名（カナ）',
    '現地調査ステータス',
    '共架・添架ステータス',
    '工事ステータス',
    '受注ステータス',
    'キャンセル日',
    'キャンセル理由',
    // セクション区切り
    '',
    // 現地調査依頼（10列）
    '現調_申請番号',
    '現調_ステータス',
    '現調_協力会社',
    '現調_班名',
    '現調_調査予定日',
    '現調_調査完了日',
    '現調_工事可否判定',
    '現調_判定報告日時',
    '現調_依頼日',
    '現調_進捗履歴最終更新日時',
    // セクション区切り
    '',
    // 共架・添架依頼（10列）
    '共架添架_申請番号',
    '共架添架_ステータス',
    '共架添架_協力会社',
    '共架添架_班名',
    '共架添架_依頼日',
    '共架添架_申請提出日',
    '共架添架_許可日',
    '共架添架_調査完了日',
    '共架添架_申請有無報告日時',
    '共架添架_進捗履歴最終更新日時',
    // セクション区切り
    '',
    // 工事依頼（10列）
    '工事_申請番号',
    '工事_ステータス',
    '工事_協力会社',
    '工事_班名',
    '工事_工事種別',
    '工事_工事依頼日',
    '工事_工事予定日',
    '工事_工事完了日',
    '工事_工事日設定日時',
    '工事_進捗履歴最終更新日時',
  ]

  // 各受注に対して申請データを紐づけて行を生成
  const rows: string[][] = []

  for (const order of orders) {
    const aggregated = aggregateApplicationsByOrderNumber(
      order.orderNumber,
      surveys,
      attachments,
      constructions
    )

    // 各申請タイプの最大数を取得
    const maxSurveys = Math.max(aggregated.surveys.length, 1)
    const maxAttachments = Math.max(aggregated.attachments.length, 1)
    const maxConstructions = Math.max(aggregated.constructions.length, 1)

    // すべての申請の組み合わせで行を生成
    const totalRows = Math.max(maxSurveys, maxAttachments, maxConstructions)

    for (let i = 0; i < totalRows; i++) {
      const survey = aggregated.surveys[i]
      const attachment = aggregated.attachments[i]
      const construction = aggregated.constructions[i]

      rows.push(convertOrderToCSVRow(order, survey, attachment, construction))
    }
  }

  // CSVフォーマット（カンマ区切り、引用符でエスケープ）
  const csvContent = [
    headers.map(escapeCSVField).join(','),
    ...rows.map(row => row.map(escapeCSVField).join(','))
  ].join('\n')

  // UTF-8 with BOM（Excelで開いた際に文字化けしない）
  return '\uFEFF' + csvContent
}

/**
 * CSVフィールドのエスケープ
 *
 * カンマ、ダブルクォート、改行を含むフィールドを適切にエスケープ
 */
function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

/**
 * CSVファイルとしてダウンロード
 *
 * @param orders エクスポート対象の工事データ配列
 * @param surveys 現地調査依頼データ
 * @param attachments 共架・添架依頼データ
 * @param constructions 工事依頼データ
 * @param filename ファイル名（省略時は自動生成）
 */
export function downloadCSV(
  orders: OrderData[],
  surveys: SurveyRequest[],
  attachments: AttachmentRequest[],
  constructions: ConstructionRequest[],
  filename?: string
): void {
  const csv = generateCSV(orders, surveys, attachments, constructions)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })

  const defaultFilename = `工事依頼_${formatDateForFilename(new Date())}.csv`
  const finalFilename = filename || defaultFilename

  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', finalFilename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 日時フォーマット（ファイル名用）
 *
 * @returns YYYYMMDD_HHMMSS形式
 */
function formatDateForFilename(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}${month}${day}_${hours}${minutes}${seconds}`
}

/**
 * ISO 8601日時文字列またはYYYY-MM-DD形式を読みやすい形式にフォーマット
 *
 * @param dateString ISO 8601日時文字列 or YYYY-MM-DD形式の日付文字列
 * @returns YYYY/MM/DD HH:MM形式（時刻がない場合はYYYY/MM/DD形式）
 */
function formatDateTime(dateString: string): string {
  if (!dateString) return ''

  const date = new Date(dateString)

  // Invalid Dateの場合は空文字を返す
  if (isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  // YYYY-MM-DD形式の場合（時刻が00:00:00の場合）
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return `${year}/${month}/${day}`
  }

  // ISO 8601日時形式の場合
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}/${month}/${day} ${hours}:${minutes}`
}
