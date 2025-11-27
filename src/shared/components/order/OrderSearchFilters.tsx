import React from 'react'
import { OrderSearchFilters as Filters } from '@/shared/hooks/useOrderSearch'
import { ConstructionCategory, individualWorkTypeOptions, collectiveWorkTypeOptions } from '@/app/orders/types'
import { Input } from '@/shared/components/ui'

interface OrderSearchFiltersProps {
  filters: Filters
  onFilterChange: (filters: Filters) => void
  onClearFilters: () => void
}

export default function OrderSearchFilters({ filters, onFilterChange, onClearFilters }: OrderSearchFiltersProps) {
  const handleChange = (field: keyof Filters, value: string) => {
    const newFilters = { ...filters, [field]: value }

    // 工事区分が変更されたら工事種別をクリア
    if (field === 'constructionCategory') {
      newFilters.workType = ''
    }

    onFilterChange(newFilters)
  }

  // 工事種別の選択肢を工事区分に応じて変更
  const getWorkTypeOptions = () => {
    if (filters.constructionCategory === '個別') {
      return individualWorkTypeOptions
    } else if (filters.constructionCategory === '集合') {
      return collectiveWorkTypeOptions
    }
    return [...individualWorkTypeOptions, ...collectiveWorkTypeOptions]
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-900">検索条件</h3>
        <button
          type="button"
          onClick={onClearFilters}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          クリア
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* 受注番号 */}
        <Input
          label="受注番号"
          value={filters.orderNumber}
          onChange={(e) => handleChange('orderNumber', e.target.value)}
          placeholder="部分一致で検索"
          className="bg-white text-gray-900"
        />

        {/* 顧客名 */}
        <Input
          label="顧客名"
          value={filters.customerName}
          onChange={(e) => handleChange('customerName', e.target.value)}
          placeholder="部分一致で検索"
          className="bg-white text-gray-900"
        />

        {/* 顧客コード */}
        <Input
          label="顧客コード"
          value={filters.customerCode}
          onChange={(e) => handleChange('customerCode', e.target.value)}
          placeholder="部分一致で検索"
          className="bg-white text-gray-900"
        />

        {/* 住所 */}
        <Input
          label="住所"
          value={filters.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="部分一致で検索"
          className="bg-white text-gray-900"
        />

        {/* 工事区分 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            工事区分
          </label>
          <select
            value={filters.constructionCategory}
            onChange={(e) => handleChange('constructionCategory', e.target.value as '' | ConstructionCategory)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
          >
            <option value="">すべて</option>
            <option value="個別">個別</option>
            <option value="集合">集合</option>
          </select>
        </div>

        {/* 工事種別 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            工事種別
          </label>
          <select
            value={filters.workType}
            onChange={(e) => handleChange('workType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
          >
            <option value="">すべて</option>
            {getWorkTypeOptions().map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* 集合住宅名 */}
        <Input
          label="集合住宅名"
          value={filters.apartmentName}
          onChange={(e) => handleChange('apartmentName', e.target.value)}
          placeholder="部分一致で検索"
          className="bg-white text-gray-900"
        />
      </div>
    </div>
  )
}
