'use client'

import React, { useState } from 'react'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { OrderData } from '../types'
import {
  SurveyRequest,
  AttachmentRequest,
  ConstructionRequest,
} from '@/features/applications/types'
import { downloadCSV } from '../lib/csvExport'

interface CsvExportButtonProps {
  orders: OrderData[]
  surveys: SurveyRequest[]
  attachments: AttachmentRequest[]
  constructions: ConstructionRequest[]
  disabled?: boolean
  className?: string
}

/**
 * CSVエクスポートボタンコンポーネント
 *
 * フィルタリングされた工事データと紐づく申請管理データをCSV形式でダウンロードします。
 * - データが0件の場合は自動的に無効化
 * - エクスポート中はローディング表示
 * - エラー時はアラート表示
 */
export default function CsvExportButton({
  orders,
  surveys,
  attachments,
  constructions,
  disabled = false,
  className = ''
}: CsvExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (orders.length === 0) {
      alert('エクスポートするデータがありません')
      return
    }

    try {
      setIsExporting(true)

      // 少し遅延を入れてローディング表示を見せる
      await new Promise(resolve => setTimeout(resolve, 300))

      downloadCSV(orders, surveys, attachments, constructions)

      // 成功メッセージは不要（ダウンロードが開始されるため）
      // ユーザーが望む場合はコメント解除
      // alert(`${orders.length}件のデータをエクスポートしました`)

    } catch (error) {
      console.error('CSV export failed:', error)
      alert('CSVエクスポートに失敗しました')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={disabled || isExporting || orders.length === 0}
      className={`
        flex items-center gap-2 px-4 py-2
        border rounded-md
        disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed
        transition-colors
        text-sm font-medium
        ${className}
      `}
      title={orders.length === 0 ? 'エクスポートするデータがありません' : `${orders.length}件をエクスポート`}
    >
      <ArrowDownTrayIcon className="w-4 h-4" />
      {isExporting ? 'エクスポート中...' : 'CSVエクスポート'}
    </button>
  )
}
