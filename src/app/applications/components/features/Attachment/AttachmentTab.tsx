import React, { useMemo, useState } from 'react'
import {
  PencilSquareIcon,
} from '@heroicons/react/24/outline'
import { AttachmentRequest, AttachmentStatus } from '@/features/applications/types'
import { Contractor } from '@/features/contractor/types'
import { getTeamsByContractorId } from '@/features/contractor/lib/contractorStorage'
import { Badge, BadgeVariant } from '@/shared/components/ui'
import FilterableTableLayout from '../../common/FilterableTableLayout'
import { useApplicationFilters } from '../../../hooks/useApplicationFilters'

interface AttachmentTabProps {
  data: AttachmentRequest[]
  contractors: Contractor[]
  onEdit: (item: AttachmentRequest) => void
}

export default function AttachmentTab({ data, contractors, onEdit }: AttachmentTabProps) {
  // 共通フィルターフックを使用
  const {
    filters,
    baseFilteredData,
    updateFilter,
    clearFilters: clearBaseFilters,
    activeFilterCount: baseActiveFilterCount,
  } = useApplicationFilters(data)

  // Attachment固有のフィルター
  const [statusFilter, setStatusFilter] = useState<'' | AttachmentStatus>('')

  // 依頼先選択時に利用可能な班を取得
  const availableTeams = useMemo(() => {
    if (!filters.contractorId) return []
    return getTeamsByContractorId(filters.contractorId)
  }, [filters.contractorId])

  // 依頼先変更時に班をリセット（共通フックが自動的に行う）
  const handleContractorChange = (contractorId: string) => {
    updateFilter('contractorId', contractorId)
  }

  // フィルタクリア
  const handleClearFilters = () => {
    clearBaseFilters()
    setStatusFilter('')
  }

  // 適用中のフィルター数をカウント
  let activeFilterCount = baseActiveFilterCount
  if (statusFilter) activeFilterCount++

  // Attachment固有のフィルターを適用
  const filtered = useMemo(() => {
    return baseFilteredData.filter((r) => {
      // 状態
      if (statusFilter && r.status !== statusFilter) {
        return false
      }

      return true
    })
  }, [baseFilteredData, statusFilter])

  const getStatusBadge = (status: AttachmentStatus): BadgeVariant => {
    const variantMap: Record<AttachmentStatus, BadgeVariant> = {
      依頼済み: 'default',
      調査済み: 'info',
      申請中: 'warning',
      申請許可: 'success',
      申請不許可: 'danger',
      キャンセル: 'danger',
    }
    return variantMap[status]
  }

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}/${month}/${day}`
  }

  // フィルターJSX
  const filterElements = (
    <>
      {/* 受注番号 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          受注番号
        </label>
        <input
          type="text"
          value={filters.orderNumber}
          onChange={(e) => updateFilter('orderNumber', e.target.value)}
          placeholder="2024031500001"
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm placeholder:text-gray-400"
        />
      </div>

      {/* 電話番号 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          電話番号
        </label>
        <input
          type="text"
          value={filters.phoneNumber}
          onChange={(e) => updateFilter('phoneNumber', e.target.value)}
          placeholder="086-123-4567"
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm placeholder:text-gray-400"
        />
      </div>

      {/* 個別/集合 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          個別/集合
        </label>
        <select
          value={filters.propertyType}
          onChange={(e) => updateFilter('propertyType', e.target.value as '' | '個別' | '集合')}
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
          value={filters.customerCode}
          onChange={(e) => updateFilter('customerCode', e.target.value)}
          placeholder="123456789"
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
          value={filters.collectiveCode}
          onChange={(e) => updateFilter('collectiveCode', e.target.value)}
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
          value={filters.contractorId}
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
          value={filters.teamId}
          onChange={(e) => updateFilter('teamId', e.target.value)}
          disabled={!filters.contractorId}
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
          onChange={(e) => setStatusFilter(e.target.value as '' | AttachmentStatus)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
        >
          <option value="">全て</option>
          <option value="依頼済み">依頼済み</option>
          <option value="調査済み">調査済み</option>
          <option value="申請中">申請中</option>
          <option value="申請許可">申請許可</option>
          <option value="申請不許可">申請不許可</option>
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
      filters={filterElements}
    >
      <div className="w-full overflow-x-auto">
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
                集合住宅コード
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
                調査完了日
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                申請提出日
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                申請許可日
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                申請要否
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={16} className="px-4 py-8 text-center text-sm text-gray-500">
                  条件に一致するデータがありません
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  {/* 整理番号 */}
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap tabular-nums">
                    {r.serialNumber}
                  </td>

                  {/* 受注番号 */}
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-medium">
                    {r.orderNumber || '-'}
                  </td>

                  {/* 個別/集合 */}
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <Badge
                      variant={r.propertyType === '個別' ? 'info' : r.propertyType === '集合' ? 'warning' : 'default'}
                      size="sm"
                    >
                      {r.propertyType || '-'}
                    </Badge>
                  </td>

                  {/* 顧客コード */}
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {r.propertyType === '個別' ? (r.customerCode || '-') : '-'}
                  </td>

                  {/* 顧客名 */}
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {r.propertyType === '個別' ? (r.customerName || '-') : (r.collectiveHousingName || '-')}
                  </td>

                  {/* 集合住宅コード */}
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {r.propertyType === '集合' ? (r.collectiveCode || '-') : '-'}
                  </td>

                  {/* 集合住宅名 */}
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {r.propertyType === '集合' ? (r.collectiveHousingName || '-') : '-'}
                  </td>

                  {/* 住所 */}
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    <div className="max-w-[200px] truncate" title={r.address}>
                      {r.address ? (r.address.length > 8 ? `${r.address.substring(0, 8)}...` : r.address) : '-'}
                    </div>
                  </td>

                  {/* 依頼先 */}
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {r.assigneeType === 'internal' ? (
                      <span className="text-blue-600 font-medium">自社{r.teamName ? ` - ${r.teamName}` : ''}</span>
                    ) : (
                      <span className="text-gray-900">{r.contractorName}{r.teamName ? ` - ${r.teamName}` : ''}</span>
                    )}
                  </td>

                  {/* 状態 */}
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <Badge variant={getStatusBadge(r.status)} size="sm">
                      {r.status}
                    </Badge>
                  </td>

                  {/* 依頼日 */}
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {formatDate(r.requestedAt)}
                  </td>

                  {/* 調査完了日 */}
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {formatDate(r.surveyCompletedAt)}
                  </td>

                  {/* 申請提出日 */}
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {formatDate(r.submittedAt)}
                  </td>

                  {/* 申請許可日 */}
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {formatDate(r.approvedAt)}
                  </td>

                  {/* 申請要否 */}
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap text-center">
                    {r.withdrawNeeded === true ? (
                      <span className="text-red-600 text-sm font-semibold">要</span>
                    ) : r.withdrawNeeded === false ? (
                      <span className="text-gray-600 text-sm">不要</span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>

                  {/* 操作 */}
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
      </div>
    </FilterableTableLayout>
  )
}
