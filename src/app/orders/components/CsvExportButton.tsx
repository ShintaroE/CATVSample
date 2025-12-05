'use client'

import React, { useState } from 'react'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { OrderData } from '../types'
import { downloadCSV } from '../lib/csvExport'

interface CsvExportButtonProps {
  orders: OrderData[]
  disabled?: boolean
  className?: string
}

/**
 * CSVエクスポートボタンコンポーネント
 *
 * フィルタリングされた工事データをCSV形式でダウンロードします。
 * - データが0件の場合は自動的に無効化
 * - エクスポート中はローディング表示
 * - エラー時はアラート表示
 */
export default function CsvExportButton({
  orders,
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

      downloadCSV(orders)

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
        bg-green-600 text-white rounded-md
        hover:bg-green-700
        disabled:bg-gray-300 disabled:cursor-not-allowed
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
