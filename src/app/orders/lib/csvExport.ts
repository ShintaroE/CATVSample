/**
 * 工事依頼管理画面 CSVエクスポート機能
 *
 * フィルタリングされた工事データをCSV形式でエクスポートします。
 */

import { OrderData } from '../types'

/**
 * OrderDataをCSV行に変換
 *
 * 基本情報18列をエクスポート:
 * - 受注番号、受注元、個別/集合、工事種別
 * - 顧客コード、顧客名、顧客タイプ、電話番号
 * - 住所、工事日、クロージャ番号
 * - 集合コード、集合住宅名
 * - 現調ステータス、許可ステータス、工事ステータス
 * - 受注ステータス、キャンセル日、キャンセル理由
 */
export function convertOrderToCSVRow(order: OrderData): string[] {
  return [
    order.orderNumber,
    order.orderSource,
    order.constructionCategory,
    order.workType,
    order.customerCode,
    order.customerName,
    order.customerType,
    order.phoneNumber || '',
    order.address || '',
    order.constructionDate || '',
    order.closureNumber || '',
    order.collectiveCode || '',
    order.collectiveHousingName || '',
    order.surveyStatus || '',
    order.permissionStatus || '',
    order.constructionStatus || '',
    order.orderStatus || 'アクティブ',
    order.cancelledAt ? formatDateTime(order.cancelledAt) : '',
    order.cancellationReason || ''
  ]
}

/**
 * CSV文字列を生成（UTF-8 with BOM）
 *
 * @param orders エクスポート対象の工事データ配列
 * @returns UTF-8 with BOMのCSV文字列
 */
export function generateCSV(orders: OrderData[]): string {
  const headers = [
    '受注番号',
    '受注元',
    '個別/集合',
    '工事種別',
    '顧客コード',
    '顧客名',
    '顧客タイプ',
    '電話番号',
    '住所',
    '工事日',
    'クロージャ番号',
    '集合コード',
    '集合住宅名',
    '現地調査ステータス',
    '共架・添架ステータス',
    '工事ステータス',
    '受注ステータス',
    'キャンセル日',
    'キャンセル理由'
  ]

  const rows = orders.map(order => convertOrderToCSVRow(order))

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
 * @param filename ファイル名（省略時は自動生成）
 */
export function downloadCSV(orders: OrderData[], filename?: string): void {
  const csv = generateCSV(orders)
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
 * ISO 8601日時文字列を読みやすい形式にフォーマット
 *
 * @returns YYYY/MM/DD HH:MM形式
 */
function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}/${month}/${day} ${hours}:${minutes}`
}
