'use client'

import React, { useMemo, useState } from 'react'
import {
  PencilSquareIcon,
} from '@heroicons/react/24/outline'
import { SurveyRequest, SurveyStatus } from '@/features/applications/types'
import { Contractor } from '@/features/contractor/types'
import { getTeamsByContractorId } from '@/features/contractor/lib/contractorStorage'
import { Badge, BadgeVariant } from '@/shared/components/ui'
import FilterableTableLayout from '../../common/FilterableTableLayout'

interface SurveyTabProps {
  data: SurveyRequest[]
  contractors: Contractor[]
  onEdit: (item: SurveyRequest) => void
}

export default function SurveyTab({ data, contractors, onEdit }: SurveyTabProps) {
  const [orderNumberFilter, setOrderNumberFilter] = useState('')
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<'' | '個別' | '集合'>('')
  const [customerCodeFilter, setCustomerCodeFilter] = useState('')
  const [collectiveCodeFilter, setCollectiveCodeFilter] = useState('')
  const [contractorIdFilter, setContractorIdFilter] = useState('')
  const [teamIdFilter, setTeamIdFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | SurveyStatus>('')

  // 依頼先選択時に利用可能な班を取得
  const availableTeams = useMemo(() => {
    if (!contractorIdFilter) return []
    return getTeamsByContractorId(contractorIdFilter)
  }, [contractorIdFilter])

  // 依頼先変更時に班フィルタをリセット
  const handleContractorChange = (contractorId: string) => {
    setContractorIdFilter(contractorId)
    setTeamIdFilter('') // 班選択をリセット
  }

  // フィルタクリア
  const handleClearFilters = () => {
    setOrderNumberFilter('')
    setPropertyTypeFilter('')
    setCustomerCodeFilter('')
    setCollectiveCodeFilter('')
    setContractorIdFilter('')
    setTeamIdFilter('')
    setStatusFilter('')
  }

  // 適用中のフィルター数をカウント
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (orderNumberFilter) count++
    if (propertyTypeFilter) count++
    if (customerCodeFilter) count++
    if (collectiveCodeFilter) count++
    if (contractorIdFilter) count++
    if (teamIdFilter) count++
    if (statusFilter) count++
    return count
  }, [orderNumberFilter, propertyTypeFilter, customerCodeFilter, collectiveCodeFilter, contractorIdFilter, teamIdFilter, statusFilter])

  const filtered = useMemo(() => {
    return data.filter((r) => {
      // 受注番号（部分一致）
      if (orderNumberFilter && !(r.orderNumber || '').toLowerCase().includes(orderNumberFilter.toLowerCase())) {
        return false
      }

      // 物件種別
      if (propertyTypeFilter && r.propertyType !== propertyTypeFilter) {
        return false
      }

      // 顧客コード（個別のみ、部分一致）
      if (customerCodeFilter && r.propertyType === '個別') {
        if (!(r.customerCode || '').includes(customerCodeFilter)) {
          return false
        }
      }

      // 集合コード（集合のみ、部分一致）
      if (collectiveCodeFilter && r.propertyType === '集合') {
        if (!(r.collectiveCode || '').includes(collectiveCodeFilter)) {
          return false
        }
      }

      // 依頼先
      if (contractorIdFilter && r.contractorId !== contractorIdFilter) {
        return false
      }

      // 班（依頼先が選択されている場合のみ）
      if (contractorIdFilter && teamIdFilter && r.teamId !== teamIdFilter) {
        return false
      }

      // 状態
      if (statusFilter && r.status !== statusFilter) {
        return false
      }

      return true
    })
  }, [data, orderNumberFilter, propertyTypeFilter, customerCodeFilter, collectiveCodeFilter, contractorIdFilter, teamIdFilter, statusFilter])

  const getStatusBadge = (status: SurveyStatus): BadgeVariant => {
    const variantMap: Record<SurveyStatus, BadgeVariant> = {
      依頼済み: 'default',
      調査日決定: 'warning',
      完了: 'success',
      キャンセル: 'danger',
    }
    return variantMap[status]
  }

  const filters = (
    <>
      {/* 受注番号 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          受注番号
        </label>
        <input
          type="text"
          value={orderNumberFilter}
          onChange={(e) => setOrderNumberFilter(e.target.value)}
          placeholder="2024031500001"
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm placeholder:text-gray-400"
        />
      </div>

      {/* 個別/集合 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          個別/集合
        </label>
        <select
          value={propertyTypeFilter}
          onChange={(e) => setPropertyTypeFilter(e.target.value as '' | '個別' | '集合')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
        >
          <option value="">全て</option>
          <option value="個別">個別</option>
          <option value="集合">集合</option>
        </select>
      </div>

      {/* 顧客コード */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          顧客コード
        </label>
        <input
          type="text"
          value={customerCodeFilter}
          onChange={(e) => setCustomerCodeFilter(e.target.value)}
          placeholder="C123456"
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm placeholder:text-gray-400"
        />
        <p className="text-xs text-gray-500 mt-1">※個別物件のみ</p>
      </div>

      {/* 集合コード */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          集合コード
        </label>
        <input
          type="text"
          value={collectiveCodeFilter}
          onChange={(e) => setCollectiveCodeFilter(e.target.value)}
          placeholder="K001"
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm placeholder:text-gray-400"
        />
        <p className="text-xs text-gray-500 mt-1">※集合物件のみ</p>
      </div>

      {/* 依頼先 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          依頼先
        </label>
        <select
          value={contractorIdFilter}
          onChange={(e) => handleContractorChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
        >
          <option value="">全て</option>
          {contractors.filter(c => c.isActive).map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* 班 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          班
        </label>
        <select
          value={teamIdFilter}
          onChange={(e) => setTeamIdFilter(e.target.value)}
          disabled={!contractorIdFilter}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <option value="">全て</option>
          {availableTeams.filter(t => t.isActive).map(t => (
            <option key={t.id} value={t.id}>{t.teamName}</option>
          ))}
        </select>
      </div>

      {/* 状態 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          状態
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as '' | SurveyStatus)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
        >
          <option value="">全て</option>
          <option value="依頼済み">依頼済み</option>
          <option value="調査日決定">調査日決定</option>
          <option value="完了">完了</option>
          <option value="キャンセル">キャンセル</option>
        </select>
      </div>
    </>
  )

  return (
    <FilterableTableLayout
      totalCount={data.length}
      filteredCount={filtered.length}
      activeFilterCount={activeFilterCount}
      onClearFilters={handleClearFilters}
      filters={filters}
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              整理番号
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              受注番号
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              個別/集合
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              顧客コード
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              顧客名
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              集合コード
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              集合住宅名
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              住所
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              依頼先
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              状態
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              依頼日
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              調査予定日
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              調査完了日
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={14} className="px-4 py-8 text-center text-sm text-gray-500">
                条件に一致するデータがありません
              </td>
            </tr>
          ) : (
            filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap tabular-nums">
                  {r.serialNumber}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-medium">
                  {r.orderNumber || '-'}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  <Badge
                    variant={r.propertyType === '個別' ? 'info' : r.propertyType === '集合' ? 'warning' : 'default'}
                    size="sm"
                  >
                    {r.propertyType || '-'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {r.propertyType === '個別' ? (r.customerCode || '-') : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {r.propertyType === '個別' ? (r.customerName || '-') : (r.collectiveHousingName || '-')}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {r.propertyType === '集合' ? (r.collectiveCode || '-') : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {r.propertyType === '集合' ? (r.collectiveHousingName || '-') : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  <div className="max-w-[200px] truncate" title={r.address}>
                    {r.address ? (r.address.length > 8 ? `${r.address.substring(0, 8)}...` : r.address) : '-'}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {r.assigneeType === 'internal' ? (
                    <span className="text-blue-600 font-medium">自社 - {r.teamName}</span>
                  ) : (
                    <span className="text-gray-900">{r.contractorName} - {r.teamName}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  <Badge variant={getStatusBadge(r.status)} size="sm">
                    {r.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {r.requestedAt || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {r.scheduledDate || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {r.completedAt || '-'}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  <button
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => onEdit(r)}
                  >
                    <PencilSquareIcon className="h-4 w-4 mr-1" />
                    編集
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </FilterableTableLayout>
  )
}
