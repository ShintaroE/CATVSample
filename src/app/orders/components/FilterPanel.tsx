import React from 'react'
import { OrderFilters } from '../hooks/useOrderFilters'
import { ConstructionCategory, individualWorkTypeOptions, collectiveWorkTypeOptions, IndividualWorkType, CollectiveWorkType, OrderStatus } from '../types'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import { Badge } from '@/shared/components/ui'

interface FilterPanelProps {
  filters: OrderFilters
  onUpdateFilter: <K extends keyof OrderFilters>(key: K, value: OrderFilters[K]) => void
  onClear: () => void
  filteredCount: number
  totalCount: number
}

export default function FilterPanel({
  filters,
  onUpdateFilter,
  onClear,
  filteredCount,
  totalCount
}: FilterPanelProps) {
  // 個別/集合に応じた工事種別オプション
  const workTypeOptions = filters.constructionCategory === '個別'
    ? individualWorkTypeOptions
    : filters.constructionCategory === '集合'
      ? collectiveWorkTypeOptions
      : []

  return (
    <div className="mb-4 bg-white rounded-lg border border-gray-200 p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">フィルター</h3>
        {/* 表示件数 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <ChartBarIcon className="w-4 h-4 text-gray-500" />
            <Badge
              variant={filteredCount !== totalCount ? 'info' : 'default'}
              size="sm"
              className="font-semibold"
            >
              表示: {filteredCount}件
            </Badge>
            <Badge variant="default" size="sm" className="font-normal">
              全: {totalCount}件
            </Badge>
          </div>
        </div>
      </div>

      {/* 第1行：受注番号、個別/集合、工事種別 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 受注番号 */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">受注番号</label>
          <input
            type="text"
            placeholder="受注番号"
            value={filters.orderNumber}
            onChange={(e) => onUpdateFilter('orderNumber', e.target.value)}
            className="w-full text-sm bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 個別/集合 */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">個別/集合</label>
          <select
            value={filters.constructionCategory}
            onChange={(e) => onUpdateFilter('constructionCategory', e.target.value as ConstructionCategory | 'all')}
            className="w-full text-sm bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべて</option>
            <option value="個別">個別</option>
            <option value="集合">集合</option>
          </select>
        </div>

        {/* 工事種別 */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">工事種別</label>
          <select
            value={filters.workType}
            onChange={(e) => onUpdateFilter('workType', e.target.value as IndividualWorkType | CollectiveWorkType | 'all')}
            className="w-full text-sm bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={filters.constructionCategory === 'all'}
          >
            <option value="all">すべて</option>
            {workTypeOptions.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 第2行：顧客コード、集合コード、受注ステータス */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        {/* 顧客コード */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">顧客コード</label>
          <input
            type="text"
            placeholder="顧客コード"
            value={filters.customerCode}
            onChange={(e) => onUpdateFilter('customerCode', e.target.value)}
            className="w-full text-sm bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 集合コード */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">集合コード</label>
          <input
            type="text"
            placeholder="集合コード"
            value={filters.apartmentCode}
            onChange={(e) => onUpdateFilter('apartmentCode', e.target.value)}
            className="w-full text-sm bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 受注ステータス */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">受注ステータス</label>
          <select
            value={filters.orderStatus}
            onChange={(e) => onUpdateFilter('orderStatus', e.target.value as OrderStatus | 'all')}
            className="w-full text-sm bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべて</option>
            <option value="アクティブ">アクティブ</option>
            <option value="キャンセル">キャンセル</option>
          </select>
        </div>
      </div>

      {/* 第3行：顧客タイプとクリアボタン */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        {/* 顧客タイプ */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">顧客タイプ</label>
          <select
            value={filters.customerType}
            onChange={(e) => onUpdateFilter('customerType', e.target.value as '新規' | '既存' | 'all')}
            className="w-full text-sm bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべて</option>
            <option value="新規">新規</option>
            <option value="既存">既存</option>
          </select>
        </div>

        {/* 空のスペース（2カラム分） */}
        <div className="md:col-span-2"></div>
      </div>

      {/* クリアボタン */}
      <div className="flex justify-end mt-4 w-full">
        <button
          onClick={onClear}
          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex-shrink-0"
        >
          クリア
        </button>
      </div>
    </div>
  )
}
