import React from 'react'
import { OrderFilters } from '../hooks/useOrderFilters'
import { ConstructionCategory, individualWorkTypeOptions, collectiveWorkTypeOptions, IndividualWorkType, CollectiveWorkType, OrderStatus } from '../types'

interface FilterPanelProps {
  filters: OrderFilters
  onUpdateFilter: <K extends keyof OrderFilters>(key: K, value: OrderFilters[K]) => void
  onReset: () => void
  filteredCount: number
  totalCount: number
}

export default function FilterPanel({
  filters,
  onUpdateFilter,
  onReset,
  filteredCount,
  totalCount
}: FilterPanelProps) {
  // 工事カテゴリに応じた工事種別オプション
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
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            {filteredCount}/{totalCount}件
          </div>
          <button
            onClick={onReset}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            リセット
          </button>
        </div>
      </div>

      {/* 基本フィルター（常時表示） */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 工事カテゴリ */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">工事カテゴリ</label>
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

      {/* 第2行：顧客タイプ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
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
      </div>
    </div>
  )
}
